# Architektur-Dokumentation: Lagerlogistik BW Digital Twin

## Überblick

Das System implementiert ein **Event-first Digital Twin Modell** für die Lagerlogistik der Bundeswehr (Munition). Der aktuelle Zustand des Lagers wird aus einem unveränderlichen Event-Stream projiziert (Event Sourcing light).

---

## Kern-Architektur

### Event Sourcing Light

```
┌─────────────────┐
│  Event Store    │ ← Unveränderliche Events (append-only)
│  (Immutable)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Projector     │ ← Berechnet aktuellen Zustand
│   (Projection)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Materialized    │ ← Aktueller Bestand pro Location
│   Views         │
└─────────────────┘
```

### Datenfluss

1. **Event-Eingang**: Scanner, Terminal, API → Event wird erzeugt
2. **Event Store**: Event wird unveränderlich gespeichert
3. **Projector**: Berechnet aus allen Events den aktuellen Zustand
4. **Materialized View**: Snapshot des aktuellen Bestands (pro Location, pro Container)
5. **UI**: Liest nur aus Materialized Views (nie direkt aus Events)

---

## Entitäten & Hierarchie

### Physische Struktur

```
Facility (FAC1)
  └── Zone (Z1, Z2, ...)
      └── Aisle/Row (A01, A02, ...)
          └── Rack/Shelf (R01, R02, ...)
              └── Bin/Slot (B01, B02, ...) ← kleinste Location
```

### Logistik-Entitäten

- **ItemType**: Munitionstyp (z.B. "155mm Artilleriegranate")
- **Lot/Batch**: Charge (z.B. "lot_993")
- **Container (HU)**: Handling Unit (Palette, Box, Kiste)
- **Location**: Standort (Zone → Aisle → Rack → Bin)

### Bewegungen & Zustand

- **Movement**: Von Location A → B (als Event)
- **InventorySnapshot**: Momentaufnahme des Bestands (projiziert)
- **Count/Reconciliation**: Inventur/Korrektur

### Sicherheit & Nachvollziehbarkeit

- **AuditLog**: Systemaktionen (zusätzlich zum Event-Log)
- **Role/Permission**: RBAC (später)
- **Alert**: Abweichung/Alarm

---

## Event-Typen

### Bewegungs-Events

- `ITEM_RECEIVED`: Wareneingang
- `PUTAWAY_COMPLETED`: Einlagerung abgeschlossen
- `MOVE_CONFIRMED`: Bewegung durchgeführt
- `PICK_CONFIRMED`: Auslagerung/Kommission

### Verwaltungs-Events

- `CONTAINER_CREATED`: HU angelegt
- `CYCLE_COUNT_RECORDED`: Zählung
- `ADJUSTMENT_APPLIED`: Korrektur

### Status-Events

- `LOCATION_BLOCKED`: Location gesperrt
- `LOCATION_UNBLOCKED`: Location entsperrt
- `ALERT_RAISED`: Alert ausgelöst
- `ALERT_RESOLVED`: Alert geschlossen

---

## Projektion (Projection)

### Inventory Projector

Berechnet aus Events:
- Aktueller Bestand pro Location (Gewicht, Anzahl Container)
- Auslastung pro Location (Gewicht / Kapazität)
- Container → Location Mapping

### Algorithmus

```typescript
1. Initialisiere alle Locations mit 0 Bestand
2. Iteriere über alle Events chronologisch:
   - ITEM_RECEIVED / PUTAWAY_COMPLETED → Container zu Location hinzufügen
   - MOVE_CONFIRMED → Container von Location A nach B verschieben
   - PICK_CONFIRMED → Container entfernen
   - ADJUSTMENT_APPLIED → Gewicht korrigieren
3. Berechne Auslastung = total_weight_kg / capacity_kg
```

---

## Zeitreise (Time Travel)

### Konzept

Zu jedem Zeitpunkt `T` kann der Zustand berechnet werden, indem nur Events bis `T` berücksichtigt werden.

```typescript
function projectAtTime(events: Event[], targetTime: string): InventorySnapshot {
  const relevantEvents = events.filter(e => e.ts <= targetTime);
  return projectInventory(relevantEvents);
}
```

### Use Cases

- "Wie war der Bestand am 12.12.2025 um 10:15?"
- Vergleich: Zustand jetzt vs. Zustand um [Zeitpunkt]
- Audit: Nachvollziehen, was zu einem bestimmten Zeitpunkt der Fall war

---

## UI-Architektur

### 4 Kern-Screens

1. **Lagerplan (MapView)**
   - 2D-Layout mit Zonen/Regalen als Shapes
   - Klick auf Bin → Side Panel mit Inhalt + Timeline
   - Heatmap: Auslastung je Zone

2. **Bestand (InventoryView)**
   - Filterbar nach Zone, ItemType, Lot, Zeitraum, Status
   - Drilldown: ItemType → Container → Location → Event-Timeline
   - Export CSV

3. **Bewegungen (MovementView)**
   - Live-Feed (WebSocket/SSE)
   - Filter nach Zeitraum, Event-Typ, User
   - Diff-Ansicht: Was hat sich seit Schichtbeginn geändert?

4. **Alerts (AlertsView)**
   - Inventurdifferenz
   - Ungewöhnliche Bewegungen (Regeln)
   - Location/Container blockiert
   - Kapazitäts- oder Policy-Verstöße

### Dashboard-Interaktionen

- **Brush/Filter**: Zeitraum auswählen → Map & Tabellen synchron
- **Hover Heatmap**: Kapazitätsauslastung je Zone
- **Click-to-Trace**: Container anklicken → Pfad + Historie
- **Compare Mode**: Zustand jetzt vs. Zustand um [Zeitpunkt]

---

## State Management

### React Context API

```typescript
TwinProvider
  ├── state: DigitalTwinState (Events, Locations, Containers, ItemTypes, Alerts)
  ├── snapshot: InventorySnapshot (projiziert)
  ├── selectedLocation: LocationCode | undefined
  └── pushEvent: (ev: EventStreamEvent) => void
```

### Realtime-Updates

- **Simulation**: Alle 15 Sekunden wird ein zufälliger MOVE_CONFIRMED Event generiert
- **Später**: WebSocket/SSE für echte Live-Updates

---

## Erweiterte Features (MVP+)

### 1. Zeitreise

- Zeitpunkt-Picker in UI
- Projektion zu diesem Zeitpunkt
- Vergleichsmodus: Jetzt vs. Zeitpunkt X

### 2. Export

- CSV-Export für Bestand
- JSON-Export für Events (Audit)
- PDF-Report für Compliance

### 3. Filter & Suche

- Volltext-Suche über Container-IDs, Lot-IDs
- Filter nach Zone, ItemType, Status
- Zeitraum-Filter (Brush)

### 4. Alerts & Regeln

- Regel-Engine für ungewöhnliche Bewegungen
- Kapazitäts-Schwellenwerte
- Inventurdifferenz-Erkennung

### 5. RBAC

- Rollen: Admin, Operator, Viewer
- Permissions für kritische Aktionen (ADJUSTMENT_APPLIED, LOCATION_BLOCKED)

---

## Technologie-Stack

- **Frontend**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: CSS Modules (später: Tailwind möglich)
- **State**: React Context API (später: Zustand/Redux möglich)
- **Realtime**: Simuliert (später: WebSocket/SSE)

---

## Datenmodell

### DigitalTwinState

```typescript
{
  locations: Record<LocationCode, Location>
  containers: Record<ContainerId, Container>
  itemTypes: Record<ItemTypeId, ItemType>
  alerts: Record<string, Alert>
  events: EventStreamEvent[]
}
```

### InventorySnapshot (Materialized View)

```typescript
{
  as_of: string (ISO 8601)
  perLocation: Record<LocationCode, {
    location_code: LocationCode
    total_weight_kg: number
    utilization: number (0-1)
    containers: ContainerId[]
  }>
}
```

---

## Skalierung & Performance

### Aktuell (MVP)

- Alle Events im Memory
- Projektion bei jedem State-Update
- Keine Pagination

### Später

- Event Store in Datenbank (PostgreSQL, EventStore)
- Materialized Views in separater Tabelle (regelmäßig aktualisiert)
- Pagination für große Event-Listen
- Caching von Projektionen

---

## Compliance & Audit

### Lückenlose Nachvollziehbarkeit

- Jedes Event ist unveränderlich
- Jedes Event hat Actor (User + Device)
- Jedes Event hat Timestamp
- Keine Löschung, nur neue Events (z.B. ALERT_RESOLVED)

### Export für Inspektionen

- CSV/PDF-Reports
- Event-Log-Export (JSON)
- Audit-Trail für kritische Aktionen

---

## Deployment

### Development

```bash
npm install
npm run dev  # Port 4173
```

### Production Build

```bash
npm run build
npm run preview
```

### Environment Variables (später)

- `VITE_API_URL`: Backend-URL
- `VITE_WS_URL`: WebSocket-URL
- `VITE_ENABLE_REALTIME`: true/false

---

## Roadmap

### Phase 1 – Truth Source ✅
- [x] Locations-Hierarchie + Lagerplan-Definition
- [x] Event Store + 6–8 Eventtypen
- [x] Projector: aktueller Bestand pro Location/Container

### Phase 2 – UI, die sofort Wert liefert ✅
- [x] Lagerplan-View + Side Panel
- [x] Bestandstabelle + Filter + Export (UI)
- [x] Bewegungsfeed (live) + einfache Suche

### Phase 3 – Realtime & Qualität
- [ ] WebSocket/SSE: Live-Updates
- [ ] Alerts (Regel-Engine) + Audit-Ansicht
- [ ] RBAC + Hardening (Logging, Secrets, Encryption-at-rest)

### Phase 4 – Erweiterte Features
- [ ] Zeitreise-UI
- [ ] Vergleichsmodus
- [ ] Export (CSV/PDF)
- [ ] Erweiterte Filter & Suche


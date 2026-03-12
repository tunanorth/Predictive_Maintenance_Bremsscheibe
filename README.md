# Lagerlogistik BW Digital Twin

Ein professionelles Event-first Digital Twin System für die Lagerlogistik der Bundeswehr (Munition). Der aktuelle Zustand des Lagers wird aus einem unveränderlichen Event-Stream projiziert (Event Sourcing light).

## 🎯 Projektziel

Ein System, das jederzeit den aktuellen und historischen Zustand der Frontlager zeigt:
- **Bestand** (Menge/Gewicht) pro Standort
- **Typ/Klasse** (Munitionstypen mit NATO-Codes)
- **Container/Charge** (Handling Units, Lots)
- **Standort** (Frontlager → Zone → Regal → Fach)
- **Zeit + Bewegungen** (Event-Timeline)
- **Audit/Compliance** (lückenlose Nachvollziehbarkeit)
- **Prädiktive Analysen** (Verbrauchsprognosen, Bestandsrisiken)
- **Außerordentliche Nutzung** (Einsätze, Übungen, NATO-Operationen)

## 🏗️ Architektur

### Event-first Modell (Event Sourcing Light)

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

### Kern-Entscheidung

**Event-first (Event Sourcing light) + Materialized Views**

- Alles, was passiert, wird als Event gespeichert (unveränderbar)
- Der aktuelle Zustand wird daraus als Projection berechnet
- Events → Stream → UI aktualisiert
- Lückenlose Nachvollziehbarkeit (Audit)
- Zeitreisen ("Wie war der Bestand am 12.12.2025 um 10:15?")
- Saubere Realtime-Pipelines (WebSocket/SSE)

## 📦 Entitäten

### Physische Struktur

- **Facility** (Frontlager-Standort: Berlin, München, Hamburg, Köln)
- **Zone** (z. B. Hallenbereich / Sicherheitsbereich)
- **Aisle / Row** (Gang/Reihe)
- **Rack / Shelf** (Regal/Ebene)
- **Bin / Slot** (Fach/Platz) ← kleinste Location

### Logistik-Entitäten

- **ItemType** (Munitionstyp, z. B. "155mm Artilleriegranate", NATO-Code, Herkunft)
- **Lot/Batch** (Charge)
- **Container (HU)** (Palette, Box, Kiste, Behälter)
- **HandlingUnit (HU)** (übergreifende Logistik-ID)

### Bewegungen & Zustand

- **Movement** (von Location A → B, mit Zeit, Grund, Auftrag)
- **InventorySnapshot** (abgeleitete Momentaufnahme)
- **Count / Reconciliation** (Inventur / Korrektur mit Begründung)
- **PlannedUsage** (geplante außerordentliche Nutzung)
- **ExtraordinaryUsage** (durchgeführte außerordentliche Nutzung)

### Sicherheit & Nachvollziehbarkeit

- **Commander** (Kommandant, zuständig für Frontlager)
- **Supplier** (Lieferant, Zulieferer)
- **Order** (Bestellung, SAP-Integration)
- **Alert** (Warnung, Abweichung)
- **Sensor** (Sensor-Integration für Echtzeitdaten)

## 🎫 Event-Typen

1. **ITEM_RECEIVED** - Eingang erfasst
2. **CONTAINER_CREATED** - HU/Container angelegt
3. **PUTAWAY_COMPLETED** - Einlagerung abgeschlossen
4. **MOVE_CONFIRMED** - Bewegung durchgeführt
5. **PICK_CONFIRMED** - Auslagerung/Kommission bestätigt
6. **CYCLE_COUNT_RECORDED** - Zählung
7. **ADJUSTMENT_APPLIED** - Korrektur mit Grund
8. **LOCATION_BLOCKED/UNBLOCKED** - Sperrung
9. **ALERT_RAISED/RESOLVED** - Abweichung/Alarm

## 🖥️ UI: Kern-Screens

### A) Frontlagerplan (Karte)

- **OpenStreetMap-Integration** mit Markern für alle Frontlager
- **Bundeswehr-Gebiete** (Truppenübungsplätze, Marine-Stützpunkte) als Polygon-Bereiche
- **Fabriken & Lieferanten** (Rheinmetall, Heckler & Koch, etc.)
- Klick auf Marker → Popup mit Details, Auslastung, Alerts
- **Legende** mit allen Marker-Typen und Sicherheitsbereichen

### B) 2D-Lagerplan

- 2D-Grid-Layout pro Zone (Regale als Boxen)
- Jede Box zeigt: Container-ID, Munitionstyp, Gewicht, Auslastung
- Status-Indikatoren (OK, Blocked, Alert)
- Klick auf Box → Side Panel mit Details und Event-Timeline
- **Zeitreise**: Zustand zu beliebigem Zeitpunkt anzeigen
- **Compare Mode**: Zustand jetzt vs. Zustand um [Zeitpunkt]

### C) Bestand

- **Tab 1: Bestand**
  - Filter: Frontlager, Zone, ItemType, Lot, Zeitraum, Status
  - Tabelle mit allen Containern
  - **Export CSV**: Bestand als CSV exportieren
  - **Neuer Munitionstyp**: Formular zum Hinzufügen neuer Munitionstypen

- **Tab 2: Außerordentliche Nutzung**
  - Formular für große Mengen-Entnahmen (Einsätze, Übungen, NATO)
  - Sofortige Systemaktualisierung
  - Automatische Nachbestellung bei kritischem Bestand
  - Historie aller außerordentlichen Nutzungen
  - Klickbare Kommandanten-Profile

### D) Bewegungen & Ereignisse

- Live-Feed (simuliert)
- Filter nach Zeitraum, Event-Typ, User, Container
- Diff-Ansicht: Was hat sich seit Schichtbeginn geändert?
- **Export Events JSON**: Event-Stream als JSON exportieren

### E) Warnungen

- Alle offenen Alerts
- Filter nach Schweregrad (Critical, Warning, Info)
- Klick auf Alert → Detail-Modal mit vollständigen Informationen
- Automatische Benachrichtigungen bei kritischen Beständen

### F) Analysen (Prädiktive Analyse)

- **Verbrauchsprognose**: Durchschnittlicher Tagesverbrauch pro Munitionstyp
- **Bestandsrisiko**: Tage bis zur Erschöpfung, Risikobewertung (CRITICAL, HIGH, MEDIUM, LOW)
- **Trend-Analyse**: Verbrauchstrends über Zeit
- **Automatische Benachrichtigungen**: Bei kritischen Beständen werden automatisch Lieferanten und Kommandanten benachrichtigt
- **Automatische Bestellungen**: System erstellt Bestellungen bei kritischem Bestand

### G) Schnittstellen

- **API-Übersicht**: Verfügbare Endpoints, Methoden, Authentifizierung
- **Sensor-Integration**: Übersicht über Sensor-Anbindungen
- **Datenraum**: Verbindungen zu externen Datenräumen
- **SAP-Integration**: Status und verfügbare Funktionen

### H) Bestellschnittstelle

- **SAP-Link**: Direkter Link zur SAP-Hauptseite
- **API-Informationen**: SAP-Verbindungsstatus, verfügbare Funktionen
- **Authentifizierung**: API-Auth-Details

### I) Dashboard

- **KPIs**: Gesamt-Container, Gesamtgewicht, Auslastung, offene Warnungen
- **Charts**: ItemType-Verteilung, Warnungs-Trend, Bewegungen
- **Frontlager-Übersicht**: Karten für jedes Frontlager mit Status
- **Klickbare Alerts**: Alle Alert-Anzeigen öffnen Detail-Modal

## 🚀 Installation & Start

### Voraussetzungen

- **Node.js 18+** und **npm**
- **PowerShell** (Windows) oder **Bash** (Linux/Mac)

### Setup

```bash
# Dependencies installieren
npm install

# Development Server starten (Port 4173)
npm run dev

# Production Build
npm run build

# Production Preview
npm run preview
```

### Browser öffnen

Nach dem Start: **http://localhost:4173** (oder der Port, den Vite anzeigt)

**Hinweis für Windows PowerShell**: Falls Execution Policy-Fehler auftreten:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
npm run dev
```

## 📁 Projektstruktur

```
├── src/
│   ├── App.tsx                    # Haupt-App-Komponente (Navigation, Layout)
│   ├── main.tsx                   # Entry Point (React DOM Render)
│   ├── domain.ts                  # TypeScript-Domänenmodell (Interfaces, Types)
│   ├── state.tsx                  # React Context (State Management, Event Store)
│   ├── views.tsx                  # Haupt-Views (Inventory, Movement, Alerts)
│   ├── mockData.ts                # Mock-Daten für Demo (Facilities, Containers, Events)
│   ├── utils.ts                   # Utilities (Export, Zeitreise, etc.)
│   ├── styles.css                 # Globales Styling (Dark Theme)
│   ├── components/
│   │   ├── Dashboard.tsx          # Dashboard-View mit KPIs und Charts
│   │   ├── MapView.tsx            # OpenStreetMap mit Frontlager-Markern
│   │   ├── AnalysisView.tsx       # Prädiktive Analysen
│   │   ├── InterfacesView.tsx     # API-Übersicht, Sensor-Integration
│   │   ├── OrderInterfaceView.tsx # SAP-Schnittstelle
│   │   ├── SensorsView.tsx       # Sensor-Übersicht
│   │   ├── AlertDetail.tsx        # Alert-Detail-Modal
│   │   ├── CommanderDetail.tsx    # Kommandanten-Detail-Modal
│   │   ├── ContainerDetail.tsx    # Container-Detail-Modal
│   │   ├── Icons.tsx              # SVG-Icons
│   │   └── MunitionIcons.tsx      # Munitions-Icons
│   └── utils/
│       └── imageLoader.ts         # Bild-Loader für Munitions-Bilder
├── docs/
│   ├── ARCHITEKTUR.md             # Detaillierte Architektur-Dokumentation
│   ├── JSON_SCHEMAS.md            # JSON-Schema-Dokumentation
│   └── MUNITIONSTYPEN_LISTE.md    # Liste aller Munitionstypen
├── examples/
│   ├── events.json                # Beispiel-Event-Stream
│   ├── locations.json             # Beispiel-Locations
│   ├── containers.json            # Beispiel-Container
│   ├── itemTypes.json             # Beispiel-ItemTypes
│   └── completeState.json         # Vollständiger State-Export
├── public/
│   └── images/
│       └── munition/              # Munitions-Bilder
├── package.json
├── vite.config.ts                 # Vite-Konfiguration (Port 4173)
├── tsconfig.json                  # TypeScript-Konfiguration
└── README.md                      # Diese Datei
```

## 🛠️ Technologie-Stack

### Frontend

- **React 18.3** - UI-Framework
- **TypeScript 5.6** - Type-Safety
- **Vite 6.0** - Build-Tool (schnell, HMR)
- **React Context API** - State Management

### Mapping & Visualisierung

- **Leaflet 1.9** - OpenStreetMap-Integration
- **react-leaflet 4.2** - React-Wrapper für Leaflet

### Charts & Analytics

- **Chart.js 4.4** - Chart-Bibliothek
- **react-chartjs-2 5.2** - React-Wrapper für Chart.js

### Styling

- **CSS** - Custom Dark Theme
- **Responsive Design** - Desktop & Tablet

### Development

- **ESLint** - Code-Quality
- **@vitejs/plugin-react-swc** - Schneller React-Compiler

## ✨ Features

### ✅ Implementiert (MVP)

- [x] Event-first Modell mit Event Store
- [x] Projektion: Aktueller Bestand pro Location/Container
- [x] 4 Kern-Views (Lagerplan, Bestand, Bewegungen, Alerts)
- [x] Zeitreise-Funktion
- [x] Vergleichsmodus (Compare Mode)
- [x] Export CSV (Bestand)
- [x] Export JSON (Events)
- [x] Filter & Suche
- [x] Live-Updates (simuliert)
- [x] 2D-Lagerplan-Visualisierung
- [x] Event-Timeline
- [x] Alert-System
- [x] OpenStreetMap-Integration
- [x] Bundeswehr-Gebiete (Truppenübungsplätze, Marine-Stützpunkte)
- [x] Fabriken & Lieferanten auf Karte
- [x] Prädiktive Analysen (Verbrauchsprognose, Bestandsrisiko)
- [x] Automatische Benachrichtigungen bei kritischen Beständen
- [x] Automatische Bestellungen
- [x] Außerordentliche Nutzung (Einsätze, Übungen)
- [x] Kommandanten-Verwaltung
- [x] Lieferanten-Verwaltung
- [x] SAP-Schnittstelle (Info-Seite)
- [x] API-Übersicht
- [x] Sensor-Integration-Übersicht
- [x] Neuer Munitionstyp hinzufügen
- [x] Dashboard mit KPIs und Charts

### 🔜 Geplant (Phase 3+)

- [ ] WebSocket/SSE für echte Live-Updates
- [ ] Regel-Engine für Alerts
- [ ] RBAC (Rollen/Rechte)
- [ ] PDF-Export
- [ ] 3D-Lagerplan
- [ ] Erweiterte Analytics
- [ ] Backend-Integration (REST API)
- [ ] Echte SAP-Integration
- [ ] Echte Sensor-Daten-Integration
- [ ] Mobile App

## 🎯 Use Cases

### 1. Aktueller Bestand abfragen

"Zeige mir den aktuellen Bestand in Zone Z2 des Frontlagers Berlin"

→ **2D-Lagerplan**: Zone auswählen → Grid zeigt alle Fächer mit Bestand

### 2. Zeitreise

"Wie war der Bestand am 12.12.2025 um 10:15?"

→ **Zeitreise-Button** → Zeitpunkt auswählen → Projektion zu diesem Zeitpunkt

### 3. Bewegungs-Historie

"Zeige mir alle Bewegungen von Container hu_100284"

→ **Bewegungen-View** → Filter nach Container-ID

### 4. Audit-Trail

"Wer hat Container hu_100284 um 14:03 bewegt?"

→ **Event-Stream** → Filter nach Container-ID → Actor-Informationen

### 5. Export für Compliance

"Exportiere alle Events des letzten Monats"

→ **Bewegungen-View** → Export Events JSON

### 6. Außerordentliche Nutzung

"500 Stück 155mm Artilleriegranaten für NATO-Übung entnehmen"

→ **Bestand → Außerordentliche Nutzung** → Formular ausfüllen → System aktualisiert sofort → Automatische Nachbestellung bei Bedarf

### 7. Prädiktive Analyse

"Welche Munitionstypen sind in den nächsten 30 Tagen kritisch?"

→ **Analysen-View** → Risikobewertung anzeigen → Automatische Benachrichtigungen

### 8. Frontlager auf Karte anzeigen

"Zeige mir alle Frontlager und Bundeswehr-Gebiete"

→ **Karte-View** → OpenStreetMap mit Markern und Polygon-Bereichen

## 🔒 Compliance & Audit

- **Lückenlose Nachvollziehbarkeit**: Jedes Event ist unveränderlich
- **Actor-Tracking**: Jedes Event hat User + Device
- **Timestamp**: Jedes Event hat präzisen Zeitstempel
- **Keine Löschung**: Nur neue Events (z.B. ALERT_RESOLVED)
- **Export**: CSV/JSON für Inspektionen
- **Kommandanten-Zuordnung**: Jede außerordentliche Nutzung ist einem Kommandanten zugeordnet

## 📝 JSON-Strukturen

Alle Event-Typen, Locations, Container etc. sind in `docs/JSON_SCHEMAS.md` dokumentiert.

### Beispiel-Event

```json
{
  "event_id": "evt_20251212_140321_001",
  "event_type": "MOVE_CONFIRMED",
  "ts": "2025-12-12T14:03:21.123Z",
  "actor": {
    "user_id": "u_17",
    "device": "scanner_3"
  },
  "payload": {
    "container_id": "hu_100284",
    "from_location": "FAC1-Z2-A03-R04-B12",
    "to_location": "FAC1-Z2-A03-R04-B08",
    "items": [
      {
        "item_type_id": "it_55",
        "lot_id": "lot_993",
        "weight_kg": 120.0
      }
    ],
    "reason": "RELOCATION",
    "ref": {
      "work_order_id": "wo_7781"
    }
  }
}
```

### Beispiel-Container

```json
{
  "container_id": "hu_100284",
  "item_type_id": "it_55",
  "location_code": "FAC1-Z2-A03-R04-B08",
  "quantity": 50,
  "weight_kg": 120.0,
  "lot_id": "lot_993",
  "created_at": "2025-12-01T08:00:00Z"
}
```

## 🎨 Design

- **Dark Theme**: Professionelles Dark-UI für Lagerumgebungen
- **Responsive**: Funktioniert auf Desktop und Tablet
- **Accessible**: Klare Kontraste, lesbare Schriftgrößen
- **Keine Animationen**: Fokus auf Performance und Klarheit

## 🗺️ Bundeswehr-Gebiete auf Karte

Die Karte zeigt folgende echte Bundeswehr-Gebiete als große Polygon-Bereiche:

- **NATO-Truppenübungsplatz Grafenwöhr** (Bayern) - Größter NATO-Übungsplatz in Europa
- **NATO-Truppenübungsplatz Hohenfels** (Bayern) - Joint Multinational Readiness Center
- **NATO-Truppenübungsplatz Baumholder** (Rheinland-Pfalz) - Artillerie- und Panzerübungsplatz
- **Truppenübungsplatz Bergen** (Niedersachsen) - Größter Panzerübungsplatz der Bundeswehr
- **Truppenübungsplatz Munster** (Niedersachsen) - Panzer- und Infanterieübungsplatz
- **Artillerie-Schießplatz Putlos** (Schleswig-Holstein) - Artillerie- und Raketenübungsplatz
- **Marine-Stützpunkt Wilhelmshaven** (Niedersachsen) - Größter Marinehafen Deutschlands
- **Marine-Stützpunkt Kiel** (Schleswig-Holstein) - Hauptstützpunkt der Deutschen Marine

## 🏭 Fabriken & Lieferanten

Die Karte zeigt folgende Fabriken und Lieferanten:

- **Rheinmetall** - Herstellungsfabrik
- **Heckler & Koch** - Herstellungsfabrik
- **Diehl Defence** - Herstellungsfabrik
- **NATO Standard Supplier** - Lieferant
- **Bundeswehr Logistikzentrum** - Verteilungszentrum

## 📞 Support & Dokumentation

Bei Fragen oder Problemen:

1. **Dokumentation lesen**: `docs/ARCHITEKTUR.md` und `docs/JSON_SCHEMAS.md`
2. **Beispiele anschauen**: `examples/` Ordner
3. **Code-Kommentare**: Alle wichtigen Funktionen sind kommentiert
4. **TypeScript-Types**: `src/domain.ts` enthält alle Interfaces

## 🐛 Bekannte Probleme / Limitationen

- **Mock-Daten**: Aktuell werden nur Mock-Daten verwendet (kein Backend)
- **Simulierte Updates**: Live-Updates sind simuliert (kein WebSocket)
- **Keine Persistenz**: State wird bei Reload zurückgesetzt
- **Keine Authentifizierung**: Kein Login-System implementiert

## 📄 Lizenz

MVP für interne Nutzung.

---

**Entwickelt für die Lagerlogistik BW · Digital Twin MVP**

*Version 0.1.0 · Stand: Dezember 2025*

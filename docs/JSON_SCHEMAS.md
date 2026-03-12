# JSON-Schema-Dokumentation für Lagerlogistik BW Digital Twin

## Übersicht

Dieses Dokument beschreibt alle JSON-Strukturen für Events, Locations, Container und weitere Entitäten im Event-first Digital Twin System.

---

## Event-Typen

### 1. ITEM_RECEIVED
Eingang von Ware/Munition erfasst.

```json
{
  "event_id": "evt_20251212_140321_001",
  "event_type": "ITEM_RECEIVED",
  "ts": "2025-12-12T14:03:21.123Z",
  "actor": {
    "user_id": "u_17",
    "device": "scanner_3"
  },
  "payload": {
    "container_id": "hu_100284",
    "to_location": "FAC1-Z2-A03-R04-B12",
    "items": [
      {
        "item_type_id": "it_55",
        "lot_id": "lot_993",
        "weight_kg": 120.0
      }
    ],
    "reason": "INCOMING_SHIPMENT",
    "ref": {
      "work_order_id": "wo_7781",
      "shipment_id": "ship_20251212_001"
    }
  }
}
```

### 2. CONTAINER_CREATED
Neue Handling Unit (HU) / Container angelegt.

```json
{
  "event_id": "evt_20251212_140500_002",
  "event_type": "CONTAINER_CREATED",
  "ts": "2025-12-12T14:05:00.000Z",
  "actor": {
    "user_id": "u_17",
    "device": "scanner_3"
  },
  "payload": {
    "container_id": "hu_100285",
    "location": "FAC1-Z1-A01-R01-B01",
    "items": [
      {
        "item_type_id": "it_55",
        "lot_id": "lot_994",
        "weight_kg": 150.0
      }
    ],
    "reason": "NEW_CONTAINER"
  }
}
```

### 3. PUTAWAY_COMPLETED
Einlagerung abgeschlossen.

```json
{
  "event_id": "evt_20251212_141000_003",
  "event_type": "PUTAWAY_COMPLETED",
  "ts": "2025-12-12T14:10:00.000Z",
  "actor": {
    "user_id": "u_18",
    "device": "scanner_5"
  },
  "payload": {
    "container_id": "hu_100284",
    "to_location": "FAC1-Z2-A03-R04-B12",
    "items": [
      {
        "item_type_id": "it_55",
        "lot_id": "lot_993",
        "weight_kg": 120.0
      }
    ],
    "reason": "PUTAWAY",
    "ref": {
      "work_order_id": "wo_7781"
    }
  }
}
```

### 4. MOVE_CONFIRMED
Bewegung von Location A nach B durchgeführt.

```json
{
  "event_id": "evt_20251212_140321_004",
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

### 5. PICK_CONFIRMED
Auslagerung/Kommission bestätigt.

```json
{
  "event_id": "evt_20251212_150000_005",
  "event_type": "PICK_CONFIRMED",
  "ts": "2025-12-12T15:00:00.000Z",
  "actor": {
    "user_id": "u_19",
    "device": "scanner_7"
  },
  "payload": {
    "container_id": "hu_100280",
    "from_location": "FAC1-Z1-A01-R01-B05",
    "to_location": null,
    "items": [
      {
        "item_type_id": "it_52",
        "lot_id": "lot_990",
        "weight_kg": 45.0
      }
    ],
    "reason": "OUTGOING_SHIPMENT",
    "ref": {
      "work_order_id": "wo_7782",
      "shipment_id": "ship_out_20251212_001"
    }
  }
}
```

### 6. CYCLE_COUNT_RECORDED
Inventur/Zählung erfasst.

```json
{
  "event_id": "evt_20251212_160000_006",
  "event_type": "CYCLE_COUNT_RECORDED",
  "ts": "2025-12-12T16:00:00.000Z",
  "actor": {
    "user_id": "u_20",
    "device": "scanner_9"
  },
  "payload": {
    "container_id": "hu_100284",
    "to_location": "FAC1-Z2-A03-R04-B12",
    "items": [
      {
        "item_type_id": "it_55",
        "lot_id": "lot_993",
        "weight_kg": 120.0
      }
    ],
    "reason": "CYCLE_COUNT",
    "ref": {
      "count_id": "count_20251212_001"
    }
  }
}
```

### 7. ADJUSTMENT_APPLIED
Korrektur mit Begründung angewendet.

```json
{
  "event_id": "evt_20251212_170000_007",
  "event_type": "ADJUSTMENT_APPLIED",
  "ts": "2025-12-12T17:00:00.000Z",
  "actor": {
    "user_id": "u_21",
    "device": "admin_terminal"
  },
  "payload": {
    "container_id": "hu_100284",
    "to_location": "FAC1-Z2-A03-R04-B12",
    "items": [
      {
        "item_type_id": "it_55",
        "lot_id": "lot_993",
        "weight_kg": 115.0
      }
    ],
    "reason": "CORRECTION_DAMAGE",
    "ref": {
      "adjustment_id": "adj_20251212_001",
      "justification": "Beschädigung festgestellt, Gewicht korrigiert"
    }
  }
}
```

### 8. LOCATION_BLOCKED
Location gesperrt.

```json
{
  "event_id": "evt_20251212_180000_008",
  "event_type": "LOCATION_BLOCKED",
  "ts": "2025-12-12T18:00:00.000Z",
  "actor": {
    "user_id": "u_21",
    "device": "admin_terminal"
  },
  "payload": {
    "location": "FAC1-Z2-A03-R04-B12",
    "blocked": true,
    "reason": "MAINTENANCE"
  }
}
```

### 9. LOCATION_UNBLOCKED
Location entsperrt.

```json
{
  "event_id": "evt_20251212_190000_009",
  "event_type": "LOCATION_UNBLOCKED",
  "ts": "2025-12-12T19:00:00.000Z",
  "actor": {
    "user_id": "u_21",
    "device": "admin_terminal"
  },
  "payload": {
    "location": "FAC1-Z2-A03-R04-B12",
    "blocked": false,
    "reason": "MAINTENANCE_COMPLETE"
  }
}
```

### 10. ALERT_RAISED
Alert/Abweichung ausgelöst.

```json
{
  "event_id": "evt_20251212_200000_010",
  "event_type": "ALERT_RAISED",
  "ts": "2025-12-12T20:00:00.000Z",
  "actor": {
    "user_id": "system",
    "device": "rule_engine"
  },
  "payload": {
    "location": "FAC1-Z2-A03-R04-B12",
    "container_id": "hu_100284",
    "severity": "WARN",
    "code": "CAPACITY_THRESHOLD",
    "text": "Auslastung über 85% an Location FAC1-Z2-A03-R04-B12"
  }
}
```

### 11. ALERT_RESOLVED
Alert geschlossen.

```json
{
  "event_id": "evt_20251212_210000_011",
  "event_type": "ALERT_RESOLVED",
  "ts": "2025-12-12T21:00:00.000Z",
  "actor": {
    "user_id": "u_21",
    "device": "admin_terminal"
  },
  "payload": {
    "location": "FAC1-Z2-A03-R04-B12",
    "container_id": null,
    "severity": "WARN",
    "code": "CAPACITY_THRESHOLD",
    "text": "Alert CAPACITY_THRESHOLD geschlossen"
  }
}
```

---

## Location-Struktur

```json
{
  "code": "FAC1-Z2-A03-R04-B12",
  "facility_id": "FAC1",
  "zone": "Z2",
  "aisle": "A03",
  "rack": "R04",
  "shelf": "S02",
  "bin": "B12",
  "x": 120.5,
  "y": 45.3,
  "z": 2.0,
  "capacity_kg": 500.0,
  "blocked": false
}
```

---

## Container-Struktur

```json
{
  "id": "hu_100284",
  "location_code": "FAC1-Z2-A03-R04-B12",
  "item_type_id": "it_55",
  "lot_id": "lot_993",
  "weight_kg": 120.0,
  "status": "OK"
}
```

Status-Werte: `"OK"`, `"PENDING_MOVE"`, `"BLOCKED"`

---

## ItemType-Struktur

```json
{
  "id": "it_55",
  "name": "155mm Artilleriegranate",
  "nato_code": "NATO-155-HE",
  "class": "EXPLOSIVE",
  "compatibility_group": "CG-1"
}
```

---

## InventorySnapshot-Struktur

```json
{
  "as_of": "2025-12-12T14:03:21.123Z",
  "perLocation": {
    "FAC1-Z2-A03-R04-B12": {
      "location_code": "FAC1-Z2-A03-R04-B12",
      "total_weight_kg": 240.0,
      "utilization": 0.48,
      "containers": ["hu_100284", "hu_100285"]
    }
  }
}
```

---

## Alert-Struktur

```json
{
  "id": "alert_20251212_200000_001",
  "ts": "2025-12-12T20:00:00.000Z",
  "severity": "WARN",
  "code": "CAPACITY_THRESHOLD",
  "text": "Auslastung über 85% an Location FAC1-Z2-A03-R04-B12",
  "location_code": "FAC1-Z2-A03-R04-B12",
  "container_id": null,
  "open": true
}
```

Severity-Werte: `"INFO"`, `"WARN"`, `"CRITICAL"`

---

## Event-Stream (Array)

```json
[
  {
    "event_id": "evt_20251212_140321_001",
    "event_type": "ITEM_RECEIVED",
    "ts": "2025-12-12T14:03:21.123Z",
    "actor": {
      "user_id": "u_17",
      "device": "scanner_3"
    },
    "payload": { ... }
  },
  {
    "event_id": "evt_20251212_140500_002",
    "event_type": "CONTAINER_CREATED",
    "ts": "2025-12-12T14:05:00.000Z",
    "actor": { ... },
    "payload": { ... }
  }
]
```

---

## Vollständiger State-Export

```json
{
  "locations": {
    "FAC1-Z2-A03-R04-B12": { ... },
    "FAC1-Z1-A01-R01-B05": { ... }
  },
  "containers": {
    "hu_100284": { ... },
    "hu_100285": { ... }
  },
  "itemTypes": {
    "it_55": { ... },
    "it_52": { ... }
  },
  "alerts": {
    "alert_20251212_200000_001": { ... }
  },
  "events": [ ... ]
}
```

---

## Validierung

- Alle `event_id` müssen eindeutig sein
- `ts` muss ISO 8601 Format sein
- `actor.user_id` ist Pflichtfeld
- `payload` muss dem jeweiligen Event-Typ entsprechen
- Location-Codes folgen dem Muster: `FAC{id}-Z{zone}-A{aisle}-R{rack}-B{bin}`
- Container-IDs beginnen mit `hu_`
- ItemType-IDs beginnen mit `it_`
- Lot-IDs beginnen mit `lot_`


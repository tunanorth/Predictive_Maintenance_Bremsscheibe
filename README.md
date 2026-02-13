# BrakeDisc Twin – Fleet Cockpit

Ein modernes React-Dashboard für Predictive Maintenance von Bremsscheiben in einer Fahrzeugflotte.

## Features

- **Fleet Overview**: Übersicht über die gesamte Flotte mit KPIs und kritischen Bremsscheiben
- **Vehicle Detail**: Detaillierte Ansicht pro Fahrzeug mit 2x2 Wheel Grid
- **Disc Deep Dive**: Side Sheet mit detaillierten Metriken und Trends
- **Alerts**: Alert-Inbox mit Filtern und Detailansicht
- **Analytics**: Flottenweite Analysen und Trends
- **Model Monitoring**: Überwachung der ML-Modelle und Datenqualität
- **Settings**: Theme-Toggle und Scenario-Switcher

## Tech Stack

- React 18 + TypeScript
- Vite
- TailwindCSS + shadcn/ui
- React Router
- TanStack Query
- Recharts
- Zod

## Setup

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Build erstellen
npm run build

# Preview Build
npm run preview
```

## Projektstruktur

```
src/
├── api/              # API Client + Mock Data
├── components/       # React Komponenten
│   ├── ui/          # shadcn/ui Komponenten
│   └── layout/      # Layout Komponenten
├── context/         # React Context (Theme, Scenario)
├── hooks/           # Custom Hooks (TanStack Query)
├── lib/             # Utilities
├── mock/            # Mock Data + Szenarien
├── pages/           # Seiten/Routes
└── types/           # TypeScript Types
```

## Szenarien

Die App unterstützt 4 Demo-Szenarien:

1. **NORMAL**: Gleichmäßiger Verschleiß, wenig Alerts
2. **THERMAL_OVERLOAD**: Hohe Temperaturspitzen an Front-Bremsscheiben
3. **UNEVEN_WEAR**: Ungleichmäßiger Verschleiß (z.B. FL schneller)
4. **SENSOR_DROPOUTS**: Sensor-Ausfälle und Datenqualitätsprobleme

Das Szenario kann in den Settings oder in der Topbar gewechselt werden.

## Design

- **Dark Mode** als Standard
- Premium, minimales Design im "Mercedes-Benz Fleet Style"
- Hoher Kontrast, präzise Typografie
- Responsive Layout

## Mock Data

Alle Daten sind Mock-Daten ohne Backend. Die Daten werden in `src/mock/data.ts` generiert und über `src/api/fleet.ts` bereitgestellt.

## Hinzufügen neuer Szenarien

1. Erstelle eine neue Datei in `src/mock/scenarios/`
2. Implementiere die Generierungsfunktion
3. Füge das Szenario in `src/mock/data.ts` hinzu
4. Füge es zu den Settings hinzu

## License

MIT


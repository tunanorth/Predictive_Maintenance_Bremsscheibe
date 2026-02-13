## 1) Kurzbeschreibung

**BrakeDisc Twin – Fleet Cockpit** ist ein React-Dashboard für Predictive Maintenance von Bremsscheiben in einer Fahrzeugflotte. Die App visualisiert eine komplett mock-basierte Flotte mit Fahrzeugen, Bremsscheiben, Alerts und Analysen in mehreren Screens.

## 2) Tech-Stack

- **Frontend**: React 18 + TypeScript, Vite, React Router (`src/App.tsx`, `src/main.tsx`)
- **UI**: TailwindCSS, shadcn/ui Komponenten (`src/components/ui/*`), Lucide Icons
- **State/Data**: React Context (`src/context/*`), TanStack Query (`src/lib/react-query.tsx`, `src/hooks/*`)
- **Backend**: Kein echtes Backend, alle Daten kommen aus lokalem Mock-Layer (`src/mock/*`, `src/api/fleet.ts`)
- **DB**: Keine echte Datenbank, Daten werden in Memory generiert (`src/mock/data.ts`, `src/mock/scenarios/*`)
- **Auth**: Simple Frontend-Auth mit LocalStorage (kein echtes Backend-Login) (`src/context/auth.tsx`, `src/pages/LoginPage.tsx`)
- **Realtime**: Keine Realtime-Technologie (kein WebSocket, SSE o.Ä. gefunden)
- **ML/Analytics**: Kennzahlen & Zeitreihen werden clientseitig simuliert (z.B. `fetchAnalytics` in `src/api/fleet.ts`, Recharts-Charts in `src/pages/*AnalyticsPage.tsx`, `src/components/TimeseriesChart.tsx`)
- **Hosting/Infra**: Vite-Build (`npm run build`) erzeugt statisches Bundle im `dist/` Ordner; keine konkrete Hosting-Konfiguration im Repo

## 3) Was ist bereits umgesetzt?

- **Mock-Daten-Backend**: 
  - Generierung einer Flotte mit Depots, Fahrzeugen, Bremsscheiben, Alerts, Events, Modellen (`src/mock/data.ts`, `src/mock/scenarios/*`, `src/types/index.ts`)
  - API-Layer, der diese Daten wie echte Endpunkte kapselt (`src/api/fleet.ts`, `src/api/client.ts`)
- **Routing & Layout**:
  - React Router mit geschützten Routen (`src/App.tsx`, `src/components/ProtectedRoute.tsx`)
  - Hauptlayout mit Sidebar und Topbar (`src/components/layout/AppLayout.tsx`, `Sidebar.tsx`, `Topbar.tsx`)
- **Login/Authentifizierung (Frontend)**:
  - Login-Page mit UI und Fake-Auth (`src/pages/LoginPage.tsx`)
  - AuthContext mit LocalStorage-Persistenz (`src/context/auth.tsx`)
- **Fleet Overview Dashboard**:
  - Fleet KPIs, Karten und Tabellen in `src/pages/FleetPage.tsx`
  - Nutzung von `useFleetOverview`, `useVehicles`, `useDiscs`, `useAlerts` (`src/hooks/*`)
- **Vehicle Detail View**:
  - Detailseite für Fahrzeuge mit Wheel Grid/Discs (`src/pages/VehiclePage.tsx`, `src/components/WheelGrid.tsx`, `WheelCard.tsx`, `DiscDetailSheet.tsx`)
- **Alerts Inbox**:
  - Alerts-Page mit Filtern, Priorisierung und Detailpanel (`src/pages/AlertsPage.tsx`, `src/components/AlertDetailPanel.tsx`)
- **Analytics & Model Monitoring**:
  - Analytics-Dashboard für Flottenmetriken (`src/pages/AnalyticsPage.tsx`)
  - Model-/Datenqualitäts-Ansicht (`src/pages/ModelsPage.tsx`)
- **Kartenansicht**:
  - Live Vehicle Locations mit Leaflet (`src/pages/MapPage.tsx`, `src/components/MapView.tsx`)
- **Settings & Szenario-Switcher**:
  - Theme-Toggle + Szenarioauswahl (`src/pages/SettingsPage.tsx`, `src/context/theme.tsx`, `src/context/scenario.tsx`)
- **UI-Bausteine**:
  - Eigene DataTable-Komponente (`src/components/DataTable.tsx`)
  - MetricCards, StatusBadges, HealthGauge, TimeseriesChart, EventTimeline etc.
- **Error Handling**:
  - ErrorBoundary (`src/components/ErrorBoundary.tsx`)
  - ErrorState für API-Fehler (`src/components/ErrorState.tsx`)
- **Build & Lint**:
  - TypeScript-Konfiguration (`tsconfig.json`), Vite-Konfiguration (`vite.config.ts`)
  - Eslint/Prettier-Konfiguration über `package.json` (Skripte `lint`, `format`)
  - Build läuft erfolgreich durch und erzeugt `dist/`

## 4) Was ist teilweise/angefangen?

- **Szenario-spezifische Mock-Logik**:
  - Basisszenario ist implementiert (`src/mock/scenarios/base.ts`, `normal.ts`).
  - Weitere Szenarien wie `thermal-overload.ts`, `uneven-wear.ts`, `sensor-dropouts.ts` enthalten teilweise Platzhalter/vereinfachte Logik und sind nicht voll ausgebaut.
- **Alert-/Event-Story**:
  - Alerts & Events werden generiert (`generateAlerts`, `generateEvents` in `src/mock/scenarios/base.ts`), aber es gibt keine echten Status-Updates oder Persistenz (nur In-Memory).
- **Map-Integration**:
  - Leaflet-Map mit Fahrzeug- und Depot-Markern existiert (`src/components/MapView.tsx`), die Logik ist aber rein lesend; es gibt z.B. keine Interaktion (Drag, Selection, Deep-Linking).
- **TestPage / Debugging**:
  - `src/TestPage.tsx` und `src/components/RouteDebug.tsx` existieren als Hilfskomponenten/Debug, sind aber nicht Teil einer finalen UX.
- **Model-/Analytics-Realismus**:
  - Die Analytics in `src/api/fleet.ts` und `src/pages/AnalyticsPage.tsx` basieren auf einfachen Random-/Aggregationslogiken, nicht auf echten ML-Modellen.

## 5) Was fehlt noch für ein überzeugendes MVP? (Top 10, priorisiert)

1. **Echter Backend-Layer**: HTTP-API statt Mock-Funktionen (z.B. REST- oder GraphQL-Service statt `src/mock/data.ts`/`src/api/fleet.ts`).
2. **Persistente Authentifizierung**: Anbindung an ein echtes Auth-System (z.B. OAuth/OIDC oder Backend-Login statt reinem LocalStorage-Flag).
3. **Echte Datenquelle/DB**: Persistente Speicherung von Flotte, Discs, Alerts und Events (z.B. SQL/NoSQL DB) statt rein in-memory Mock.
4. **Schreibende Operationen**: Aktionen wie Alert-Status ändern, Kommentare hinzufügen, Wartungsjobs anlegen (derzeit nur lesende Views).
5. **API-Fehler-Handling & Loading-Zustände auf allen Pages**: Viele Stellen sind bereits relativ gut, aber ein MVP bräuchte konsistente Loading-/Error-Zustände und eventuell Retry-Logik über alle Routen hinweg.
6. **Rollen-/Rechtekonzept**: Unterscheidung z.B. Dispatcher, Werkstatt, Admin (aktuell nicht vorhanden).
7. **Realistische Zeitreihen/ML-Schnittstelle**: Anbindung an echtes ML/Analytics-Backend oder zumindest an ein klar definiertes Model-Metrics-API statt komplett simuliert.
8. **Deployment-Konfiguration**: Konkrete Anweisungen/Files für Hosting (Dockerfile, CI/CD-Pipeline, Env-Handling für Prod; aktuell nur Vite-Standardbuild).
9. **Tests**: Unit-/Integration-Tests für kritische Hooks/Komponenten; aktuell sind keine Testdateien im Repo sichtbar.
10. **Konfigurierbare Szenarien/Parameter**: UI, um z.B. Schwellenwerte, Alert-Logik oder Szenario-Intensitäten zu konfigurieren (derzeit nur Auswahl eines festen Szenarios).

## 6) Architektur-Übersicht: Module/Ordner + Datenfluss

- **Frontend Shell**:
  - Einstieg über `index.html` → `src/main.tsx` → `src/App.tsx`.
  - `main.tsx` setzt Theme, Auth-, Scenario- und ReactQuery-Provider auf.
- **Routing & Layout**:
  - `src/App.tsx` definiert alle Routen (Login, Fleet, Map, Vehicles, Alerts, Analytics, Models, Settings, Test) und kapselt sie in `AppLayout` + `ProtectedRoute`.
- **Datenfluss (Frontend → "API" → Mock-Daten)**:
  - Pages und Hooks (`src/pages/*`, `src/hooks/*`) rufen Funktionen aus `src/api/fleet.ts`.
  - `src/api/fleet.ts` kapselt alle Datenzugriffe und nutzt `simulateFetch` aus `src/api/client.ts`, um Latenz/Fehler zu simulieren.
  - `src/mock/data.ts` und `src/mock/scenarios/*` generieren die eigentlichen Objekte (Flotte, Vehicles, Discs, Alerts, Events, Models) im Speicher.
  - Es gibt **keinen Netzwerk-Request** und keine echte DB – alles passiert im Browser/JS-Prozess.
- **State/Context**:
  - Auth (`src/context/auth.tsx`), Theme (`src/context/theme.tsx`), Scenario (`src/context/scenario.tsx`), Search (`src/context/search.tsx`).
  - TanStack Query (`src/lib/react-query.tsx`) wird für Datenfetching/Caching verwendet, allerdings nur gegen die lokale Mock-API.
- **Jobs/ML**:
  - Es gibt keine separaten Job- oder ML-Services; ML-/Analytics-Funktionalität ist in `src/api/fleet.ts` und den Mock-Szenarien eingebettet.

## 7) Wichtige Routen/Pages + wichtigste UI Screens

- **`/login` – LoginPage** (`src/pages/LoginPage.tsx`)
  - Einstieg in die App mit Branding, Marketing-Text und einfachem Login-Formular.
- **`/fleet` – FleetPage** (`src/pages/FleetPage.tsx`)
  - Zentrale Fleet-KPIs, Health-Metriken, Listen von Vehicles und "Top At-Risk Discs".
- **`/vehicles/:vehicleId` – VehiclePage** (`src/pages/VehiclePage.tsx`)
  - Detailansicht eines Fahrzeugs, Wheel Grid, tiefergehende Disc-Details über `DiscDetailSheet`.
- **`/alerts` – AlertsPage** (`src/pages/AlertsPage.tsx`)
  - Alert-Inbox mit Filtern, Priorisierung, Export und Detailpanel.
- **`/analytics` – AnalyticsPage** (`src/pages/AnalyticsPage.tsx`)
  - Charts und Trends über die Flotte, inklusive Health- und Load-Visualisierungen.
- **`/models` – ModelsPage** (`src/pages/ModelsPage.tsx`)
  - Übersicht über Modellversionen und Model-/Datenqualitätsmetriken.
- **`/map` – MapPage** (`src/pages/MapPage.tsx`, `src/components/MapView.tsx`)
  - Karte mit Fahrzeug- und Depot-Markern.
- **`/settings` – SettingsPage** (`src/pages/SettingsPage.tsx`)
  - Theme-Umschaltung (hell/dunkel) und Szenariowechsel.
- **`/test` – TestPage** (`src/TestPage.tsx`)
  - Interne Test-/Debug-Seite, nicht für Endnutzer gedacht.

Wichtigste UI Screens sind Login, Fleet Dashboard, Vehicle Detail, Alerts Inbox, Analytics und Map.

## 8) API-Endpunkte (falls vorhanden)

Es gibt **keine echten HTTP-API-Endpunkte** im Sinne von `/api/...` Routen oder einem Backend-Server. Stattdessen existiert ein **interner API-Layer als Funktions-API** in `src/api/fleet.ts`, z.B.:

- `fetchFleet`, `fetchFleetOverview`, `fetchVehicles`, `fetchVehicle`, `fetchDiscs`, `fetchDiscTimeseries`, `fetchAlerts`, `fetchEvents`, `fetchAnalytics`, `fetchModels`

Alle diese Funktionen sind **ohne Auth** und laufen nur im Frontend-Kontext.

## 9) Datenmodell/Tabellen (falls vorhanden) + wichtigste Felder

Es gibt keine Datenbanktabellen, aber definierte TypeScript-Modelle in `src/types/index.ts`:

- **Fleet**
  - Felder: `id`, `name`, `region`, `depots: Depot[]`
- **Depot**
  - Felder: `id`, `name`, `city`, `vehicles: Vehicle[]`, `location { lat, lng }`
- **Vehicle**
  - Felder: `id`, `name`, `model_code`, `vin_masked`, `mileage_km`, `depotId`, `last_seen`, `status`, `overall_risk`, `overall_health_score`, optionale `location { lat, lng, heading, speed, lastUpdate }`
- **BrakeDisc**
  - Felder: `discId`, `vehicleId`, `position`, `axle`, `disc_thickness_mm`, `disc_min_thickness_mm`, `wear_pct`, `temp_peak_C`, `thermal_stress_index`, `brake_judder_index`, `harsh_brakes_per_100km`, `health_score`, `risk`, `predicted_rul_km`, `predicted_rul_days`, `confidence`, `last_service_date`, `open_alerts_count`
- **Alert**
  - Felder: `id`, `createdAt`, `severity`, `category`, `status`, `vehicleId`, `discId`, `position`, `recommended_action`, `predicted_lead_time_km`, `false_positive_risk`, `commentThread`
- **Event**
  - Felder: `id`, `ts`, `type`, `severity`, `vehicleId`, `discId`, `position`, `title`, `description`, `related_metric_keys`
- **Models / AnalyticsData / DataQuality**
  - Zusammenfassung der Modellversionen, Performance-Metriken und Datenqualitätskennzahlen.

## 10) Konfiguration: env vars + wie man lokal startet

- **Env Vars**:
  - Im Repo ist **keine** `.env` oder `.env.example` vorhanden.
  - Es gibt keine offensichtliche Nutzung von `import.meta.env` oder ähnlichem in den gezeigten Dateien.
- **Lokaler Start** (aus `README.md` und `package.json`):
  - Dependencies installieren:
    - `npm install`
  - Dev-Server starten (Port wurde im Projekt aktuell auf 8080 gelegt, siehe `vite.config.ts`):
    - `npm run dev`
  - Build erstellen:
    - `npm run build`
  - Build-Preview (statischer Server über Vite):
    - `npm run preview`

## 11) Qualität: Tests/Lint/Build — was ist vorhanden?

- **Tests**:
  - Keine Testdateien (`*.test.ts(x)` oder ähnliches) im `src/` Ordner sichtbar.
  - Kein Jest/Vitest/Testing Library in `package.json`-Dependencies.
- **Linting**:
  - Eslint konfiguriert über `@typescript-eslint` und React-Plugins (`package.json` Skript `npm run lint`).
  - TypeScript-Optionen wie `strict: true`; Regeln für unbenutzte Variablen wurden leicht gelockert (`noUnusedLocals/noUnusedParameters: false`).
- **Formatting**:
  - Prettier-Skript (`npm run format`) für `src/**/*.{ts,tsx,css}`.
- **Build**:
  - `npm run build` (`tsc && vite build`) läuft erfolgreich durch und erzeugt produktionsfähigen Bundle in `dist/`.

## 12) Risiken/Bugs: konkrete Stellen

- **Kein echtes Backend / keine Persistenz**:
  - Alle Daten werden im Frontend generiert und leben nur im Speicher (`src/mock/*`). Für ein echtes Produkt fehlen Persistenz, Security und Multi-User-Fähigkeit.
- **Auth nur Fake**:
  - `src/context/auth.tsx` akzeptiert jedes beliebige Email/Passwort und schreibt nur LocalStorage; kein Schutz gegenüber echten Angreifern.
- **Szenario-Logik teilweise rudimentär**:
  - Dateien wie `src/mock/scenarios/thermal-overload.ts` und `uneven-wear.ts` enthalten vereinfachte oder Platzhalter-Implementierungen.
- **Fehlende Tests**:
  - Keine automatisierten Tests; Änderungen können leicht unbemerkt bestehende Funktionalität brechen.
- **Reine Client-Side-ML/Analytics-Simulation**:
  - Analytics- und Model-Metriken sind zufallsbasiert/simuliert; es gibt keine Anbindung an echte ML-Modelle.
- **Keine Security-/Hardening-Maßnahmen**:
  - Keine CSP/Helmet-Konfiguration, keine Rate Limits, keine Input-Validierung auf API-Ebene (da kein Backend vorhanden).

## Next recommended actions

- **Phase A: Stabilisieren (1–2 Tage)**
  - Codebasis konsolidieren (unbenutzte Szenario-Logik und Debug-Komponenten sichten und entweder entfernen oder klar markieren).
  - Minimales Monitoring: einbauen von Logging/Tracing-Hooks in kritischen Hooks/Pages.
  - Basic-Refactoring für Konsistenz (z.B. einheitliches Error-/Loading-Handling in allen Pages).

- **Phase B: MVP fertig (1–2 Wochen)**
  - Kleines echtes Backend (REST/GraphQL) + DB aufsetzen und `src/api/fleet.ts` schrittweise von Mock auf HTTP umstellen.
  - Echte Auth (z.B. JWT/OIDC), inkl. Rollen/Rechte und Session-Handling.
  - Schreibende Flows implementieren (Alerts ack/resolved setzen, Kommentare hinzufügen, Maintenance-Tasks erfassen).
  - 3–5 zentrale End-to-End-Flows definieren und automatisierte Tests dafür aufsetzen.

- **Phase C: Krass machen (später)**
  - Anbindung an echte ML-Modelle und Streaming-/Realtime-Datenquellen (z.B. Telemetrie).
  - Multi-Tenant-Fähigkeit, Mandantenkonfiguration, erweiterte Reporting-/Export-Funktionalität.
  - Hardening: Security-Review, Performance-Tuning, Observability (Dashboards, Alerts) und saubere CI/CD-Pipeline mit Qualitätstoren.


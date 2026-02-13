import { MapView } from '@/components/MapView';

export function MapPage() {
  return (
    <div className="space-y-10 animate-fade-in">
      <div className="mb-10">
        <h1 className="text-4xl font-light text-slate-900 dark:text-slate-100 tracking-tight mb-3">
          Fleet Map
        </h1>
        <p className="text-base text-slate-700 dark:text-slate-200 leading-relaxed">
          Live location data of the Mercedes Vito fleet with Predictive Maintenance status
        </p>
      </div>
      <MapView />
    </div>
  );
}


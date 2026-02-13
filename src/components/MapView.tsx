import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useDiscs } from '@/hooks/use-discs';
import { useFleet } from '@/hooks/use-fleet';
import { useScenario } from '@/context/scenario';
import { StatusBadge } from './StatusBadge';
import { formatNumber } from '@/lib/utils';
import type { Vehicle } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Truck, AlertTriangle, MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

function createCustomIcon(risk: Vehicle['overall_risk'], hasAlerts: boolean) {
  const color = risk === 'CRITICAL' ? '#dc2626' : risk === 'WARN' ? '#0ea5e9' : '#10b981';
  const size = hasAlerts ? 32 : 28;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        ${hasAlerts ? 'animation: pulse 2s infinite;' : ''}
      ">
        ${hasAlerts ? '⚠' : '🚐'}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function MapBounds({ vehicles }: { vehicles: Vehicle[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;
    
    const locations = vehicles
      .filter(v => v.location && typeof v.location.lat === 'number' && typeof v.location.lng === 'number')
      .map(v => [v.location!.lat, v.location!.lng] as [number, number]);
    
    if (locations.length > 0) {
      try {
        const bounds = L.latLngBounds(locations);
        map.fitBounds(bounds, { padding: [50, 50] });
      } catch (error) {
        map.setView([51.1657, 10.4515], 6);
      }
    } else {
      map.setView([51.1657, 10.4515], 6);
    }
  }, [map, vehicles]);

  return null;
}

export function MapView() {
  const navigate = useNavigate();
  const { scenario } = useScenario();
  const { data: fleet, isLoading: fleetLoading, error: fleetError } = useFleet(scenario);
  const { data: allDiscs } = useDiscs();
  const [mapReady, setMapReady] = useState(false);

  // Use vehicles from fleet so IDs match getVehicle() on the vehicle page (no stale cache)
  const vehicles = fleet?.depots?.flatMap((d) => d.vehicles ?? []) ?? [];
  useEffect(() => {
    if (!fleetLoading && fleet) {
      const timer = setTimeout(() => setMapReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [fleetLoading, fleet]);

  const vehiclesWithLocation = vehicles.filter(
    (v) =>
      v.location &&
      typeof v.location.lat === 'number' &&
      typeof v.location.lng === 'number' &&
      !isNaN(v.location.lat) &&
      !isNaN(v.location.lng) &&
      v.status === 'ACTIVE'
  );
  const depots = fleet?.depots ?? [];

  if (fleetError) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">Error loading data</div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            {fleetError?.message ?? 'Unknown error'}
          </div>
        </div>
      </div>
    );
  }

  if (fleetLoading || !fleet) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="text-gray-500 dark:text-gray-400 text-lg">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Live Vehicle Locations</h2>
          <p className="text-sm text-slate-700 dark:text-slate-200">
            {vehiclesWithLocation.length} vehicles with active location data
          </p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div 
          id="map-container"
          className="h-[600px] w-full" 
          style={{ 
            minHeight: '600px',
            position: 'relative',
            zIndex: 0
          }}
        >
          {mapReady && (
            <MapContainer
              center={[51.1657, 10.4515]}
              zoom={6}
              style={{ 
                height: '100%', 
                width: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 1
              }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
                tileSize={256}
              />
              
              <MapBounds vehicles={vehiclesWithLocation} />

              {depots.map((depot) => {
                if (!depot.location || typeof depot.location.lat !== 'number' || typeof depot.location.lng !== 'number') {
                  return null;
                }
                
                return (
                  <Marker
                    key={depot.id}
                    position={[depot.location.lat, depot.location.lng]}
                    icon={L.divIcon({
                      className: 'custom-marker',
                      html: `
                        <div style="
                          width: 28px;
                          height: 28px;
                          background-color: #3b82f6;
                          border: 3px solid white;
                          border-radius: 4px;
                          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                          display: flex;
                          align-items: center;
                          justify-content: center;
                        ">
                          <span style="color: white; font-size: 16px;">📍</span>
                        </div>
                      `,
                      iconSize: [28, 28],
                      iconAnchor: [14, 14],
                    })}
                  >
                    <Popup>
                      <div className="p-2">
                        <div className="font-semibold">{depot.name}</div>
                        <div className="text-sm text-slate-700 dark:text-slate-200">{depot.city}</div>
                        <div className="text-xs text-slate-700 dark:text-slate-200 mt-1">
                          {depot.vehicles.length} vehicles
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {vehiclesWithLocation.map((vehicle) => {
                if (!vehicle.location || 
                    typeof vehicle.location.lat !== 'number' || 
                    typeof vehicle.location.lng !== 'number' ||
                    isNaN(vehicle.location.lat) ||
                    isNaN(vehicle.location.lng)) {
                  return null;
                }
                
                const vehicleDiscs = allDiscs?.filter(d => d.vehicleId === vehicle.id) || [];
                const criticalDiscs = vehicleDiscs.filter(d => d.risk === 'CRITICAL').length;
                const hasAlerts = criticalDiscs > 0 || vehicle.overall_risk === 'CRITICAL';
                
                return (
                  <Marker
                    key={`vehicle-${vehicle.id}`}
                    position={[vehicle.location.lat, vehicle.location.lng]}
                    icon={createCustomIcon(vehicle.overall_risk, hasAlerts)}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold">{vehicle.name}</div>
                          <StatusBadge status={vehicle.overall_risk} />
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-700 dark:text-slate-200">Model:</span>
                            <span>{vehicle.model_code}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-700 dark:text-slate-200">Health:</span>
                            <span>{formatNumber(vehicle.overall_health_score, 1)}%</span>
                          </div>
                          {vehicle.location?.speed && (
                            <div className="flex justify-between">
                              <span className="text-slate-700 dark:text-slate-200">Speed:</span>
                              <span>{formatNumber(vehicle.location.speed, 0)} km/h</span>
                            </div>
                          )}
                          {criticalDiscs > 0 && (
                            <div className="flex items-center gap-1 text-red-600 text-xs mt-2">
                              <AlertTriangle className="h-3 w-3" />
                              <span>{criticalDiscs} critical brake discs</span>
                            </div>
                          )}
                          <div className="mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full"
                              onClick={() => {
                                navigate(`/vehicles/${vehicle.id}`);
                              }}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-slate-700 dark:text-slate-200" />
              <div>
                <div className="text-2xl font-bold">{vehiclesWithLocation.length}</div>
                <div className="text-xs text-slate-700 dark:text-slate-200">Active vehicles</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-slate-700 dark:text-slate-200" />
              <div>
                <div className="text-2xl font-bold">{depots.length}</div>
                <div className="text-xs text-slate-700 dark:text-slate-200">Depots</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              <div>
                <div className="text-2xl font-bold text-rose-600">
                  {vehiclesWithLocation.filter(v => v.overall_risk === 'CRITICAL').length}
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-200">Critical vehicles</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-sky-500" />
              <div>
                <div className="text-2xl font-bold text-sky-600">
                  {vehiclesWithLocation.filter(v => v.overall_risk === 'WARN').length}
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-200">Warnings</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

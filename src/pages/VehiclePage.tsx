import { useParams } from 'react-router-dom';
import { useVehicle } from '@/hooks/use-vehicles';
import { useDiscs } from '@/hooks/use-discs';
import { useEvents } from '@/hooks/use-events';
import { WheelGrid } from '@/components/WheelGrid';
import { DiscDetailSheet } from '@/components/DiscDetailSheet';
import { EventTimeline } from '@/components/EventTimeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ErrorState } from '@/components/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber, formatDate } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import type { BrakeDisc } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { getVitoImageForId } from '@/lib/vito-images';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { addVehicleNote, getVehicleNotes, type PersistedVehicleNote } from '@/lib/persist';

export function VehiclePage() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const { data: vehicle, isLoading, error } = useVehicle(vehicleId || '');
  const { data: discs, isLoading: discsLoading } = useDiscs(vehicleId);
  const { data: events, isLoading: eventsLoading } = useEvents(vehicleId);
  const [selectedDisc, setSelectedDisc] = useState<BrakeDisc | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [notes, setNotes] = useState<PersistedVehicleNote[]>([]);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    if (vehicleId) setNotes(getVehicleNotes(vehicleId));
  }, [vehicleId, isNoteDialogOpen]);

  const handleAddNote = () => {
    if (!vehicleId || !noteText.trim()) return;
    addVehicleNote(vehicleId, noteText.trim());
    setNotes(getVehicleNotes(vehicleId));
    setNoteText('');
    setIsNoteDialogOpen(false);
  };

  const handleExport = () => {
    if (!vehicle || !discs) return;
    const payload = { vehicle, discs, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vehicle-${vehicle.id}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load vehicle'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (isLoading || !vehicle) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const handleDiscClick = (disc: BrakeDisc) => {
    flushSync(() => {
      setSelectedDisc(disc);
      setIsSheetOpen(true);
    });
  };

  const handleCloseDiscSheet = (open: boolean) => {
    if (!open) {
      setIsSheetOpen(false);
      setSelectedDisc(null);
    }
  };

  const alerts = events?.filter((e) => e.type === 'ALERT') || [];
  const history = events || [];

  return (
    <div className="space-y-10 animate-fade-in">
      <Card className="rounded-3xl overflow-hidden border-slate-200 dark:border-slate-800 mb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6">
          <img
            src={getVitoImageForId(vehicle.id)}
            alt=""
            className="w-full sm:w-48 h-40 sm:h-32 rounded-2xl object-cover flex-shrink-0 bg-slate-100 dark:bg-slate-800"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl font-light text-slate-900 dark:text-slate-100 tracking-tight mb-2">
              {vehicle.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
              <span>{vehicle.model_code}</span>
              <span>•</span>
              <span>VIN {vehicle.vin_masked}</span>
              <span>•</span>
              <span>{formatNumber(vehicle.mileage_km)} km</span>
              <span>•</span>
              <StatusBadge status={vehicle.overall_risk} />
            </div>
          </div>
          <div className="flex gap-3 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setIsNoteDialogOpen(true)}
          >
            <FileText className="h-4 w-4 mr-2" />
            Add Note
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="brakes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="brakes">Brakes</TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts ({alerts.length})
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
          <TabsTrigger value="metrics">Metric glossary</TabsTrigger>
        </TabsList>

        <TabsContent value="brakes" className="space-y-4">
          {discsLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <WheelGrid
              discs={discs || []}
              onDiscClick={handleDiscClick}
            />
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-slate-700 dark:text-slate-200">
                No alerts for this vehicle
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <Card key={alert.id}>
                  <CardHeader>
                    <CardTitle className="text-sm">{alert.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      {alert.description}
                    </p>
                    <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                      {formatDate(alert.ts)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {eventsLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <EventTimeline events={history} />
          )}
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {notes.length === 0 ? (
                <p className="text-sm text-slate-700 dark:text-slate-200 py-6 text-center">
                  No notes yet. Add one with the button above.
                </p>
              ) : (
                <ul className="space-y-3">
                  {notes.map((note) => (
                    <li
                      key={note.id}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-sm"
                    >
                      <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                        {note.text}
                      </p>
                      <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                        {note.author} · {formatDate(note.createdAt)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Metric glossary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-800 dark:text-slate-100">
              <p>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Judder index
                </span>
                <span className="text-slate-700 dark:text-slate-200">
                  {': '}
                  measures vibration in the braking system (higher = more steering wheel or pedal
                  vibration felt by the driver).
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Thermal stress index
                </span>
                <span className="text-slate-700 dark:text-slate-200">
                  {': '}
                  captures how strongly the disc is thermally loaded over time (high peaks and fast
                  cycles can lead to cracking or warping).
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  RUL (remaining useful life)
                </span>
                <span className="text-slate-700 dark:text-slate-200">
                  {': '}
                  estimated remaining distance until the disc reaches its minimum thickness limit
                  under current usage.
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Harsh brakes per 100 km
                </span>
                <span className="text-slate-700 dark:text-slate-200">
                  {': '}
                  number of high deceleration events normalised to 100 km, indicating a more
                  aggressive driving or operating style.
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Disc temperature / peak temperature
                </span>
                <span className="text-slate-700 dark:text-slate-200">
                  {': '}
                  typical operating temperature range and short-term peaks of the brake disc,
                  important for fade and thermal ageing.
                </span>
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedDisc ? (
        <DiscDetailSheet
          disc={selectedDisc}
          open={true}
          onOpenChange={handleCloseDiscSheet}
        />
      ) : null}

      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add note</DialogTitle>
            <DialogDescription>
              Add a note for this vehicle. It will be stored locally.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter your note…"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="min-h-[120px] resize-y"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote} disabled={!noteText.trim()}>
              Save note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


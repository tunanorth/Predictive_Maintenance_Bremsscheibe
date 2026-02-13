import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '@/lib/utils';
import type { Alert } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface AlertDetailPanelProps {
  alert: Alert;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAcknowledge?: (alert: Alert) => void | Promise<void>;
  onResolve?: (alert: Alert) => void | Promise<void>;
}

export function AlertDetailPanel({
  alert,
  open,
  onOpenChange,
  onAcknowledge,
  onResolve,
}: AlertDetailPanelProps) {
  const [loading, setLoading] = useState<'ack' | 'resolve' | null>(null);

  const handleAcknowledge = async () => {
    if (!onAcknowledge) return;
    setLoading('ack');
    try {
      await Promise.resolve(onAcknowledge(alert));
      onOpenChange(false);
    } finally {
      setLoading(null);
    }
  };

  const handleResolve = async () => {
    if (!onResolve) return;
    setLoading('resolve');
    try {
      await Promise.resolve(onResolve(alert));
      onOpenChange(false);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Alert Details</SheetTitle>
          <SheetDescription>
            Detaillierte Informationen zu diesem Alert
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2">
            <StatusBadge status={alert.severity} />
            <span className="text-sm text-slate-700 dark:text-slate-200">
              {alert.category}
            </span>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wide text-slate-700 dark:text-slate-200">
                Kontext
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-700 dark:text-slate-200">Fahrzeug:</span>
                <span className="font-medium">{alert.vehicleId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 dark:text-slate-200">Position:</span>
                <span className="font-medium uppercase">{alert.position}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 dark:text-slate-200">Erstellt:</span>
                <span className="font-medium">{formatDate(alert.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 dark:text-slate-200">Status:</span>
                <span className="font-medium uppercase">{alert.status}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wide text-slate-700 dark:text-slate-200">
                Empfohlene Aktion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{alert.recommended_action}</p>
              <div className="mt-4 space-y-2 text-xs text-slate-700 dark:text-slate-200">
                <div>
                  Lead Time: {alert.predicted_lead_time_km} km
                </div>
                <div>
                  False Positive Risk:{' '}
                  {Math.round(alert.false_positive_risk * 100)}%
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleAcknowledge}
              disabled={loading !== null || alert.status !== 'OPEN'}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {loading === 'ack' ? '…' : 'Acknowledge'}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleResolve}
              disabled={loading !== null}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {loading === 'resolve' ? '…' : 'Resolve'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}


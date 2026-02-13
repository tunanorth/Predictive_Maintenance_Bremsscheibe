import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import type { Event } from '@/types';
import { StatusBadge } from './StatusBadge';
import { Clock, Wrench, FileText, AlertTriangle } from 'lucide-react';

const eventIcons = {
  ALERT: AlertTriangle,
  INSPECTION: Wrench,
  MAINTENANCE: Wrench,
  NOTE: FileText,
};

export function EventTimeline({ events }: { events: Event[] }) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium uppercase tracking-wide">
          Event history
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedEvents.length === 0 ? (
            <p className="text-sm text-slate-700 dark:text-slate-200 text-center py-8">
              Keine Events verfügbar
            </p>
          ) : (
            sortedEvents.map((event) => {
              const Icon = eventIcons[event.type] || Clock;
              return (
                <div
                  key={event.id}
                  className="flex gap-4 pb-4 border-b last:border-0 last:pb-0"
                >
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">{event.title}</h4>
                      {event.severity && (
                        <StatusBadge status={event.severity} />
                      )}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-200">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-700 dark:text-slate-200">
                      <span>{formatDate(event.ts)}</span>
                      {event.position && (
                        <span className="uppercase">{event.position}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}


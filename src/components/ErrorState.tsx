import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Ein Fehler ist aufgetreten',
  onRetry,
}: ErrorStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-slate-700 dark:text-slate-200 mb-4">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            Erneut versuchen
          </Button>
        )}
      </CardContent>
    </Card>
  );
}


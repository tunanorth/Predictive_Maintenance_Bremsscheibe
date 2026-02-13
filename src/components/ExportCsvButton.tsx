import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ExportCsvButtonProps {
  data: Array<Record<string, any>>;
  filename: string;
  headers?: string[];
}

export function ExportCsvButton({
  data,
  filename,
  headers,
}: ExportCsvButtonProps) {
  const exportToCsv = () => {
    if (data.length === 0) return;

    const csvHeaders = headers || Object.keys(data[0]);
    const csvRows = [
      csvHeaders.join(','),
      ...data.map((row) =>
        csvHeaders.map((header) => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value;
        }).join(',')
      ),
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button variant="outline" size="sm" onClick={exportToCsv}>
      <Download className="h-4 w-4 mr-2" />
      CSV Export
    </Button>
  );
}


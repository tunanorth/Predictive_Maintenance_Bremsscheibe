import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ReactNode } from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  isLoading,
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#020817] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-[#E7E0EC] dark:border-[#49454F] hover:bg-transparent">
            {columns.map((col, idx) => (
              <TableHead key={idx} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow className="border-slate-200 dark:border-slate-700 hover:bg-transparent">
              <TableCell colSpan={columns.length} className="text-center py-12 text-slate-500 dark:text-slate-300">
                Keine Daten verfügbar
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow
                key={row.id}
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                className={onRowClick ? 'cursor-pointer border-[#E7E0EC] dark:border-[#49454F] hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'border-[#E7E0EC] dark:border-[#49454F]'}
                onClick={(e) => {
                  if (onRowClick) {
                    e.preventDefault();
                    e.stopPropagation();
                    onRowClick(row);
                  }
                }}
                onKeyDown={onRowClick ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onRowClick(row);
                  }
                } : undefined}
              >
                {columns.map((col, idx) => (
                  <TableCell key={idx} className={col.className}>
                    {typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : String(row[col.accessor])}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

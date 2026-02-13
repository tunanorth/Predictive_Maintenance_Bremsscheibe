import { WheelCard } from './WheelCard';
import type { BrakeDisc } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

interface WheelGridProps {
  discs: BrakeDisc[];
  onDiscClick?: (disc: BrakeDisc) => void;
  isLoading?: boolean;
}

const positions: Array<{ pos: BrakeDisc['position']; label: string }> = [
  { pos: 'FL', label: 'Front left' },
  { pos: 'FR', label: 'Front right' },
  { pos: 'RL', label: 'Rear left' },
  { pos: 'RR', label: 'Rear right' },
];

export function WheelGrid({ discs, onDiscClick, isLoading }: WheelGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {positions.map(({ pos, label }) => {
        const disc = discs.find((d) => d.position === pos);
        return (
          <WheelCard
            key={pos}
            disc={disc}
            position={pos}
            label={label}
            onClick={() => disc && onDiscClick?.(disc)}
          />
        );
      })}
    </div>
  );
}


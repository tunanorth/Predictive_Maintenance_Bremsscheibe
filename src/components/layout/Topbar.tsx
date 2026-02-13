import { useState, useEffect } from 'react';
import { Search, Moon, Sun, LogOut, User, Command } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/context/theme';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { useScenario } from '@/context/scenario';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from '@/hooks/use-vehicles';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import type { Scenario } from '@/types';
import { getVitoImageForId } from '@/lib/vito-images';
import { StatusBadge } from '@/components/StatusBadge';

export function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const { scenario, setScenario } = useScenario();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: vehicles } = useVehicles();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const q = searchQuery.trim().toLowerCase();
  const filteredVehicles = vehicles?.filter(
    (v) =>
      !q ||
      v.name.toLowerCase().includes(q) ||
      v.vin_masked.toLowerCase().includes(q) ||
      v.model_code.toLowerCase().includes(q)
  ) ?? [];

  const handleSearchSelect = (vehicleId: string) => {
    navigate(`/vehicles/${vehicleId}`);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white dark:bg-[#020817] px-6 transition-colors">
        <div className="flex flex-1 items-center gap-4">
          {/* Globale Suche */}
          <div className="relative flex-1 max-w-2xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Search vehicles, VIN, model..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value) setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="pl-12 pr-24 h-12 bg-slate-50 dark:bg-[#020617] border-slate-200 dark:border-[#111827] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-[#020617] focus:border-mercedes-accent focus:ring-2 focus:ring-mercedes-accent/30 transition-all rounded-2xl"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-slate-400">
                <kbd className="hidden sm:inline-flex h-6 select-none items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#020617] px-2 font-mono text-[10px] font-medium">
                  <Command className="h-3 w-3" />
                  K
                </kbd>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={scenario}
            onValueChange={(value) => setScenario(value as Scenario)}
          >
            <SelectTrigger className="w-[180px] h-10 text-sm border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-[#020817] dark:text-slate-100 rounded-2xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NORMAL">Normal operation</SelectItem>
              <SelectItem value="THERMAL_OVERLOAD">Thermal overload</SelectItem>
              <SelectItem value="UNEVEN_WEAR">Uneven wear</SelectItem>
              <SelectItem value="SENSOR_DROPOUTS">Sensor dropouts</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Darstellung umschalten"
            className="h-10 w-10 rounded-full"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Konto</p>
                  <p className="text-xs leading-none text-slate-700 dark:text-slate-200">
                    {user?.email || 'Benutzer'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer rounded-xl">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Abmelden</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Command Palette */}
      <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <CommandInput
          placeholder="Search by name, VIN or model..."
          value={searchQuery}
          onValueChange={setSearchQuery}
          className="rounded-2xl"
        />
        <CommandList>
          <CommandEmpty>No vehicles found. Try VIN, name or model.</CommandEmpty>
          <CommandGroup heading="Vehicles">
            {filteredVehicles.slice(0, 10).map((vehicle) => (
              <CommandItem
                key={vehicle.id}
                value={`${vehicle.name} ${vehicle.vin_masked} ${vehicle.model_code}`}
                onSelect={() => handleSearchSelect(vehicle.id)}
                className="cursor-pointer rounded-xl gap-3 py-3"
              >
                <img
                  src={getVitoImageForId(vehicle.id)}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-slate-100 dark:bg-slate-800"
                />
                <div className="flex flex-1 items-center justify-between min-w-0">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{vehicle.name}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 truncate">
                      {vehicle.model_code} • VIN {vehicle.vin_masked}
                    </div>
                  </div>
                  <StatusBadge status={vehicle.overall_risk} />
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

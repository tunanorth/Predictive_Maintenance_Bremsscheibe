import { useTheme } from '@/context/theme';
import { useScenario } from '@/context/scenario';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Scenario } from '@/types';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { scenario, setScenario } = useScenario();

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="mb-10">
        <h1 className="text-4xl font-light text-[#0F172A] dark:text-[#E5E7EB] tracking-tight mb-3">
          Settings
        </h1>
        <p className="text-base text-[#4B5563] dark:text-[#CBD5F5] leading-relaxed">
          Configure appearance, demo scenarios and cockpit behaviour.
        </p>
      </div>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl font-medium">
            Appearance
          </CardTitle>
          <CardDescription className="mt-1">
            Hell-/Dunkelmodus für das Fleet Cockpit wählen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#020817]">
            <Label
              htmlFor="theme-switch"
              className="text-sm font-medium text-[#0F172A] dark:text-[#E5E7EB]"
            >
              Dark mode
            </Label>
            <Switch
              id="theme-switch"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl font-medium">
            Demo scenario
          </CardTitle>
          <CardDescription className="mt-1">
            Select demo scenarios for fleet load and wear patterns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#020817]">
            <Label
              htmlFor="scenario-select"
              className="text-sm font-medium mb-3 block text-[#0F172A] dark:text-[#E5E7EB]"
            >
              Scenario
            </Label>
              <Select
                value={scenario}
                onValueChange={(value) => setScenario(value as Scenario)}
              >
                <SelectTrigger id="scenario-select" className="rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORMAL">Normal operation</SelectItem>
                  <SelectItem value="THERMAL_OVERLOAD">Thermal overload</SelectItem>
                  <SelectItem value="UNEVEN_WEAR">Uneven wear</SelectItem>
                  <SelectItem value="SENSOR_DROPOUTS">Sensor dropouts</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-[#4B5563] dark:text-[#CBD5F5] mt-3 leading-relaxed">
                Scenarios control distribution and intensity of wear, thermal load
                and data quality issues in the demo data.
              </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


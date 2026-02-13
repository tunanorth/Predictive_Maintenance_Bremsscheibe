import { z } from 'zod';

const STORAGE_KEY = 'brakedisc-twin-state';
const CURRENT_VERSION = 1;

export type PersistedAlertOverride = {
  id: string;
  status?: 'OPEN' | 'ACK' | 'RESOLVED' | 'SNOOZED';
  assignee?: string | null;
  snoozedUntil?: string | null;
  comments?: {
    id: string;
    author: string;
    text: string;
    createdAt: string;
  }[];
};

export type PersistedMaintenanceTaskStatus =
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'DONE'
  | 'CANCELLED';

export type PersistedMaintenanceTask = {
  id: string;
  vehicleId: string;
  discId: string | null;
  dueDate: string | null;
  dueMileage: number | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: PersistedMaintenanceTaskStatus;
  notes: string;
  createdAt: string;
};

export type PersistedActivityEvent = {
  id: string;
  ts: string;
  type:
    | 'ALERT_ACK'
    | 'ALERT_RESOLVED'
    | 'ALERT_SNOOZED'
    | 'TASK_CREATED'
    | 'TASK_UPDATED';
  message: string;
  vehicleId?: string;
  discId?: string | null;
  alertId?: string;
};

export type PersistedVehicleNote = {
  id: string;
  vehicleId: string;
  text: string;
  createdAt: string;
  author?: string;
};

const PersistedStateSchema = z.object({
  version: z.number(),
  alerts: z.record(z.string(), z.any()).optional(),
  tasks: z.array(z.any()).optional(),
  activity: z.array(z.any()).optional(),
  vehicleNotes: z.array(z.any()).optional(),
});

export type PersistedState = z.infer<typeof PersistedStateSchema>;

function getInitialState(): PersistedState {
  return {
    version: CURRENT_VERSION,
    alerts: {},
    tasks: [],
    activity: [],
    vehicleNotes: [],
  };
}

export function loadPersistedState(): PersistedState {
  if (typeof window === 'undefined') return getInitialState();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialState();

    const parsed = JSON.parse(raw);
    const result = PersistedStateSchema.safeParse(parsed);
    if (!result.success || result.data.version !== CURRENT_VERSION) {
      return getInitialState();
    }
    return {
      alerts: {},
      tasks: [],
      activity: [],
      vehicleNotes: [],
      ...result.data,
    };
  } catch {
    return getInitialState();
  }
}

export function savePersistedState(state: PersistedState) {
  if (typeof window === 'undefined') return;
  const toSave: PersistedState = {
    ...state,
    version: CURRENT_VERSION,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

export function updatePersistedState(
  updater: (prev: PersistedState) => PersistedState
) {
  const prev = loadPersistedState();
  const next = updater(prev);
  savePersistedState(next);
  return next;
}

export function upsertAlertOverride(
  override: PersistedAlertOverride
): PersistedState {
  return updatePersistedState((prev) => ({
    ...prev,
    alerts: {
      ...(prev.alerts || {}),
      [override.id]: {
        ...(prev.alerts?.[override.id] || {}),
        ...override,
      },
    },
  }));
}

export function getAlertOverrides(): Record<string, PersistedAlertOverride> {
  const state = loadPersistedState();
  return (state.alerts || {}) as Record<string, PersistedAlertOverride>;
}

export function addTask(task: PersistedMaintenanceTask): PersistedState {
  return updatePersistedState((prev) => ({
    ...prev,
    tasks: [...(prev.tasks || []), task],
  }));
}

export function updateTask(
  taskId: string,
  patch: Partial<PersistedMaintenanceTask>
): PersistedState {
  return updatePersistedState((prev) => ({
    ...prev,
    tasks: (prev.tasks || []).map((t: PersistedMaintenanceTask) =>
      t.id === taskId ? { ...t, ...patch } : t
    ),
  }));
}

export function getTasks(): PersistedMaintenanceTask[] {
  const state = loadPersistedState();
  return (state.tasks || []) as PersistedMaintenanceTask[];
}

export function addActivity(event: PersistedActivityEvent): PersistedState {
  return updatePersistedState((prev) => ({
    ...prev,
    activity: [...(prev.activity || []), event],
  }));
}

export function getActivity(): PersistedActivityEvent[] {
  const state = loadPersistedState();
  return (state.activity || []) as PersistedActivityEvent[];
}

export function addVehicleNote(
  vehicleId: string,
  text: string,
  author?: string
): PersistedVehicleNote {
  const note: PersistedVehicleNote = {
    id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    vehicleId,
    text,
    createdAt: new Date().toISOString(),
    author: author ?? 'User',
  };
  updatePersistedState((prev) => ({
    ...prev,
    vehicleNotes: [...(prev.vehicleNotes || []), note],
  }));
  return note;
}

export function getVehicleNotes(vehicleId: string): PersistedVehicleNote[] {
  const state = loadPersistedState();
  const notes = (state.vehicleNotes || []) as PersistedVehicleNote[];
  return notes
    .filter((n) => n.vehicleId === vehicleId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}


import type { Alert } from '@/types';
import {
  addActivity,
  addTask,
  PersistedMaintenanceTask,
  PersistedMaintenanceTaskStatus,
  PersistedActivityEvent,
  PersistedAlertOverride,
  upsertAlertOverride,
  updateTask,
} from '@/lib/persist';

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function updateAlertStatus(
  alert: Alert,
  status: Alert['status']
) {
  const override: PersistedAlertOverride = {
    id: alert.id,
    status,
  };
  upsertAlertOverride(override);

  const activity: PersistedActivityEvent = {
    id: generateId('act'),
    ts: new Date().toISOString(),
    type: status === 'RESOLVED' ? 'ALERT_RESOLVED' : 'ALERT_ACK',
    message:
      status === 'RESOLVED'
        ? `Alert ${alert.id} resolved`
        : `Alert ${alert.id} acknowledged`,
    vehicleId: alert.vehicleId,
    discId: alert.discId,
    alertId: alert.id,
  };
  addActivity(activity);
}

export async function snoozeAlert(alert: Alert, days: number) {
  const until = new Date();
  until.setDate(until.getDate() + days);

  const override: PersistedAlertOverride = {
    id: alert.id,
    status: 'SNOOZED',
    snoozedUntil: until.toISOString(),
  };
  upsertAlertOverride(override);

  const activity: PersistedActivityEvent = {
    id: generateId('act'),
    ts: new Date().toISOString(),
    type: 'ALERT_SNOOZED',
    message: `Alert ${alert.id} snoozed for ${days} days`,
    vehicleId: alert.vehicleId,
    discId: alert.discId,
    alertId: alert.id,
  };
  addActivity(activity);
}

export async function createMaintenanceTask(input: {
  vehicleId: string;
  discId: string | null;
  dueDate: string | null;
  dueMileage: number | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  notes: string;
}) {
  const task: PersistedMaintenanceTask = {
    id: generateId('task'),
    vehicleId: input.vehicleId,
    discId: input.discId,
    dueDate: input.dueDate,
    dueMileage: input.dueMileage,
    priority: input.priority,
    status: 'PLANNED',
    notes: input.notes,
    createdAt: new Date().toISOString(),
  };
  addTask(task);

  const activity: PersistedActivityEvent = {
    id: generateId('act'),
    ts: new Date().toISOString(),
    type: 'TASK_CREATED',
    message: `Maintenance task created for vehicle ${task.vehicleId}`,
    vehicleId: task.vehicleId,
    discId: task.discId,
  };
  addActivity(activity);

  return task;
}

export async function updateMaintenanceTaskStatus(
  taskId: string,
  status: PersistedMaintenanceTaskStatus
) {
  updateTask(taskId, { status });

  const activity: PersistedActivityEvent = {
    id: generateId('act'),
    ts: new Date().toISOString(),
    type: 'TASK_UPDATED',
    message: `Task ${taskId} updated to ${status}`,
  };
  addActivity(activity);
}


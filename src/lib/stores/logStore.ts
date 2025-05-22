import { writable } from 'svelte/store';
import type { DailyLog, MonthlyLog, MonthlyLogDay, FutureLog, FutureLogEntry, Task } from '../types';
// We might need to interact with taskStore later for task details, but for now, logs will store IDs.

// --- Daily Log Store ---
const initialDailyLogs: Record<string, DailyLog> = JSON.parse(localStorage.getItem('dailyLogs') || '{}');
const dailyLogs = writable<Record<string, DailyLog>>(initialDailyLogs);

dailyLogs.subscribe(value => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('dailyLogs', JSON.stringify(value));
  }
});

function addTaskIdToDailyLog(date: string, taskId: string) {
  dailyLogs.update(logs => {
    const log = logs[date] || { date, tasks: [] };
    if (!log.tasks.includes(taskId)) {
      log.tasks.push(taskId);
    }
    return { ...logs, [date]: log };
  });
}

function removeTaskFromDailyLog(date: string, taskId: string) {
  dailyLogs.update(logs => {
    const log = logs[date];
    if (log) {
      log.tasks = log.tasks.filter(id => id !== taskId);
      return { ...logs, [date]: log };
    }
    return logs;
  });
}

function getDailyLog(date: string): DailyLog | undefined {
  let log: DailyLog | undefined;
  dailyLogs.subscribe(value => {
    log = value[date];
  })(); // Immediate subscribe and unsubscribe
  return log;
}

// --- Monthly Log Store ---
const initialMonthlyLogs: Record<string, MonthlyLog> = JSON.parse(localStorage.getItem('monthlyLogs') || '{}');
// Key for monthlyLogs will be 'YYYY-MM'
const monthlyLogs = writable<Record<string, MonthlyLog>>(initialMonthlyLogs);

monthlyLogs.subscribe(value => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('monthlyLogs', JSON.stringify(value));
  }
});

function addTaskIdToMonthlyLog(year: number, month: number, day: number, taskId: string) {
  const key = `${year}-${String(month).padStart(2, '0')}`;
  monthlyLogs.update(logs => {
    const log = logs[key] || { year, month, days: [] };
    let dayEntry = log.days.find(d => d.day === day);
    if (!dayEntry) {
      dayEntry = { day, tasks: [] };
      log.days.push(dayEntry);
      // Sort days for consistency, optional
      log.days.sort((a, b) => a.day - b.day);
    }
    if (!dayEntry.tasks.includes(taskId)) {
      dayEntry.tasks.push(taskId);
    }
    return { ...logs, [key]: log };
  });
}

function removeTaskFromMonthlyLog(year: number, month: number, day: number, taskId: string) {
  const key = `${year}-${String(month).padStart(2, '0')}`;
  monthlyLogs.update(logs => {
    const log = logs[key];
    if (log) {
      const dayEntry = log.days.find(d => d.day === day);
      if (dayEntry) {
        dayEntry.tasks = dayEntry.tasks.filter(id => id !== taskId);
      }
      // Optional: remove dayEntry if tasks array is empty
      // Optional: remove log if days array is empty
    }
    return { ...logs, [key]: log };
  });
}

function getMonthlyLog(year: number, month: number): MonthlyLog | undefined {
  const key = `${year}-${String(month).padStart(2, '0')}`;
  let log: MonthlyLog | undefined;
  monthlyLogs.subscribe(value => {
    log = value[key];
  })();
  return log;
}

// --- Future Log Store ---
const initialFutureLog: FutureLog = JSON.parse(localStorage.getItem('futureLog') || '{ "entries": [] }');
const futureLog = writable<FutureLog>(initialFutureLog);

futureLog.subscribe(value => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('futureLog', JSON.stringify(value));
  }
});

function generateId(): string { // Re-declare or import if it's not accessible here
  return Math.random().toString(36).substring(2, 15);
}

function addFutureLogEntry(entryData: Omit<FutureLogEntry, 'id' | 'createdAt' | 'completed'>) {
  futureLog.update(log => {
    const newEntry: FutureLogEntry = {
      ...entryData,
      id: generateId(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    log.entries.push(newEntry);
    return log;
  });
}

function updateFutureLogEntry(id: string, updates: Partial<Omit<FutureLogEntry, 'id' | 'createdAt'>>) {
  futureLog.update(log => {
    log.entries = log.entries.map(entry =>
      entry.id === id ? { ...entry, ...updates } : entry
    );
    return log;
  });
}

function removeFutureLogEntry(id: string) {
  futureLog.update(log => {
    log.entries = log.entries.filter(entry => entry.id !== id);
    return log;
  });
}

function toggleFutureLogEntryCompletion(id: string) {
  futureLog.update(log => {
    log.entries = log.entries.map(entry =>
      entry.id === id ? { ...entry, completed: !entry.completed } : entry
    );
    return log;
  });
}


export const dailyLogStore = {
  subscribe: dailyLogs.subscribe,
  addTaskIdToDailyLog,
  removeTaskFromDailyLog,
  getDailyLog
};

export const monthlyLogStore = {
  subscribe: monthlyLogs.subscribe,
  addTaskIdToMonthlyLog,
  removeTaskFromMonthlyLog,
  getMonthlyLog
};

export const futureLogStore = {
  subscribe: futureLog.subscribe,
  addFutureLogEntry,
  updateFutureLogEntry,
  removeFutureLogEntry,
  toggleFutureLogEntryCompletion,
  getEntries: () => { // Helper to get all entries
    let entries: FutureLogEntry[] = [];
    futureLog.subscribe(value => entries = value.entries)();
    return entries;
  }
};

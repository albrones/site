export interface Task {
  id: string; // Unique identifier
  description: string;
  completed: boolean;
  priority?: 'high' | 'medium' | 'low'; // Optional priority
  dueDate?: string; // Optional due date in ISO format (e.g., '2024-07-28')
  createdAt: string; // ISO format
}

export interface DailyLog {
  date: string; // ISO format for the day (e.g., '2024-07-28')
  tasks: string[]; // Array of Task IDs
}

export interface MonthlyLogDay {
  day: number; // Day of the month (1-31)
  tasks: string[]; // Array of Task IDs for this specific day in the month
  notes?: string; // Optional notes for the day
}

export interface MonthlyLog {
  month: number; // Month (1-12)
  year: number; // Year (e.g., 2024)
  days: MonthlyLogDay[]; // Tasks and notes for each day of the month
}

export interface FutureLogEntry {
  id: string; // Unique ID for the future log entry/task
  description: string;
  targetMonth?: number; // Optional target month (1-12)
  targetYear?: number; // Optional target year
  completed: boolean;
  createdAt: string; // ISO format
}

export interface FutureLog {
  // Could be structured per year or as a continuous list
  entries: FutureLogEntry[];
}

export interface CustomList {
  id: string; // Unique identifier for the list
  name: string;
  tasks: string[]; // Array of Task IDs
}

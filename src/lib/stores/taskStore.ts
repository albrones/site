import { writable } from 'svelte/store';
import type { Task } from '../types';

// Helper to generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

const initialTasks: Task[] = JSON.parse(localStorage.getItem('tasks') || '[]');

const tasks = writable<Task[]>(initialTasks);

// Subscribe to changes and update localStorage
tasks.subscribe(value => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('tasks', JSON.stringify(value));
  }
});

// Store methods
function addTask(description: string, priority?: 'high' | 'medium' | 'low', dueDate?: string) {
  const newTask: Task = {
    id: generateId(),
    description,
    completed: false,
    priority,
    dueDate,
    createdAt: new Date().toISOString(),
  };
  tasks.update(currentTasks => [...currentTasks, newTask]);
}

function updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) {
  tasks.update(currentTasks =>
    currentTasks.map(task =>
      task.id === id ? { ...task, ...updates } : task
    )
  );
}

function deleteTask(id: string) {
  tasks.update(currentTasks => currentTasks.filter(task => task.id !== id));
}

function toggleTaskCompletion(id: string) {
  tasks.update(currentTasks =>
    currentTasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    )
  );
}

export default {
  subscribe: tasks.subscribe,
  addTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  // Helper to get all tasks (can be used by other stores)
  getAllTasks: () => {
    let allTasks: Task[] = [];
    tasks.subscribe(value => allTasks = value)(); // immediate subscribe and unsubscribe
    return allTasks;
  }
};

import { writable } from 'svelte/store';
import type { CustomList } from '../types';

// Helper to generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

const initialLists: CustomList[] = JSON.parse(localStorage.getItem('customLists') || '[]');

const lists = writable<CustomList[]>(initialLists);

lists.subscribe(value => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('customLists', JSON.stringify(value));
  }
});

function addList(name: string): string /* returns new list ID */ {
  const newListId = generateId();
  const newList: CustomList = {
    id: newListId,
    name,
    tasks: [],
  };
  lists.update(currentLists => [...currentLists, newList]);
  return newListId;
}

function deleteList(listId: string) {
  lists.update(currentLists => currentLists.filter(list => list.id !== listId));
  // Consider what happens to tasks in this list. For now, they are just disassociated.
  // A more complex system might move them to a default list or mark them as unlisted.
}

function renameList(listId: string, newName: string) {
  lists.update(currentLists =>
    currentLists.map(list =>
      list.id === listId ? { ...list, name: newName } : list
    )
  );
}

function addTaskToList(listId: string, taskId: string) {
  lists.update(currentLists =>
    currentLists.map(list => {
      if (list.id === listId && !list.tasks.includes(taskId)) {
        return { ...list, tasks: [...list.tasks, taskId] };
      }
      return list;
    })
  );
}

function removeTaskFromList(listId: string, taskId: string) {
  lists.update(currentLists =>
    currentLists.map(list => {
      if (list.id === listId) {
        return { ...list, tasks: list.tasks.filter(id => id !== taskId) };
      }
      return list;
    })
  );
}

function getList(listId: string): CustomList | undefined {
  let list: CustomList | undefined;
  lists.subscribe(value => {
    list = value.find(l => l.id === listId);
  })();
  return list;
}

function getAllLists(): CustomList[] {
  let allLists: CustomList[] = [];
  lists.subscribe(value => {
    allLists = value;
  })();
  return allLists;
}

export default {
  subscribe: lists.subscribe,
  addList,
  deleteList,
  renameList,
  addTaskToList,
  removeTaskFromList,
  getList,
  getAllLists,
};

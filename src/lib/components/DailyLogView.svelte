<script lang="ts">
  import type { Task, DailyLog } from '../types';
  import taskStore from '../stores/taskStore';
  import { dailyLogStore } from '../stores/logStore';
  import TaskItem from './TaskItem.svelte';
  import { onMount, afterUpdate } from 'svelte';

  export let date: string; // ISO date string, e.g., "2024-07-28"

  let tasksForDay: Task[] = [];
  let newTaskDescription: string = '';

  // $: acts as a reactive statement, re-running when date or stores change.
  $: {
    const log = $dailyLogStore[date]; // Access store value with $
    if (log) {
      const allTasks = $taskStore; // Access taskStore value
      tasksForDay = log.tasks
        .map(taskId => allTasks.find(t => t.id === taskId))
        .filter(task => task !== undefined) as Task[];
    } else {
      tasksForDay = [];
    }
  }

  function handleAddTask() {
    if (!newTaskDescription.trim()) return;

    // 1. Add to taskStore (which returns nothing, but we can find it)
    // We need a way to get the new task's ID.
    // For simplicity, let's assume taskStore.addTask could return the new task or its ID,
    // or we can find it by description and creation time shortly after.
    // Modifying taskStore.addTask to return the new Task would be cleaner.
    // For now, let's add a temporary solution and refine later if needed.

    const tempId = `temp-${Date.now()}`; // Temporary approach
    taskStore.addTask(newTaskDescription);

    // Find the task we just added. This is a bit brittle.
    // A better way would be for addTask to return the created task.
    // Or listen to changes in taskStore to get the latest task.
    let addedTask: Task | undefined;
    const unsubscribe = taskStore.subscribe(allTasks => {
        addedTask = allTasks.find(t => t.description === newTaskDescription && !tasksForDay.some(td => td.id === t.id));
    });
    unsubscribe();


    if (addedTask) {
      dailyLogStore.addTaskIdToDailyLog(date, addedTask.id);
    } else {
      // Fallback or error: find the latest task added if description matches
      // This is to make it work without modifying taskStore for now
      const allCurrentTasks = $taskStore;
      const potentiallyAddedTask = allCurrentTasks.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                      .find(t => t.description === newTaskDescription);
      if(potentiallyAddedTask && !tasksForDay.some(td => td.id === potentiallyAddedTask.id)) {
        dailyLogStore.addTaskIdToDailyLog(date, potentiallyAddedTask.id);
      } else {
        console.error("Failed to find the newly added task to link to daily log.");
      }
    }
    
    newTaskDescription = ''; // Clear input
  }

  // Formatted date for display
  $: formattedDate = new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

</script>

<div class="daily-log-view">
  <h3>Daily Log for: {formattedDate}</h3>

  <div class="add-task-form">
    <input type="text" bind:value={newTaskDescription} placeholder="Add a new task for today" />
    <button on:click={handleAddTask}>Add Task</button>
  </div>

  <div class="task-list">
    {#if tasksForDay.length > 0}
      {#each tasksForDay as task (task.id)}
        <TaskItem {task} currentContextType="daily" currentContextId={date} />
      {/each}
    {:else}
      <p>No tasks for this day yet.</p>
    {/if}
  </div>
</div>

<style>
  .daily-log-view {
    padding: 15px;
    border: 1px solid #ccc;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .add-task-form {
    display: flex;
    margin-bottom: 15px;
  }

  .add-task-form input {
    flex-grow: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .add-task-form button {
    padding: 8px 12px;
    margin-left: 8px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .add-task-form button:hover {
    background-color: #0056b3;
  }

  .task-list p {
    color: #777;
  }
</style>

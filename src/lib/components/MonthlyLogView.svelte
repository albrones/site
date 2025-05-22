<script lang="ts">
  import type { Task, MonthlyLog, MonthlyLogDay } from '../types';
  import { monthlyLogStore } from '../stores/logStore';
  import taskStore from '../stores/taskStore';
  import { createEventDispatcher } from 'svelte';

  export let currentYear: number = new Date().getFullYear();
  export let currentMonth: number = new Date().getMonth() + 1; // 1-12 for months

  const dispatch = createEventDispatcher<{ dayClicked: { year: number, month: number, day: number } }>();

  interface CalendarDay {
    day: number;
    month: number; // 1-12
    year: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    taskCount: number;
    tasks: Task[]; // Store full task objects if needed for quick preview, or just IDs
  }

  let calendarGridDays: CalendarDay[] = [];
  let monthName: string = '';

  // Reactive block to regenerate calendar when props or stores change
  $: {
    generateCalendarDays(currentYear, currentMonth);
    const dateForMonthName = new Date(currentYear, currentMonth - 1);
    monthName = dateForMonthName.toLocaleString('default', { month: 'long' });
  }

  function getTasksForDay(year: number, month: number, day: number): Task[] {
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    const monthData = $monthlyLogStore[monthKey];
    if (!monthData) return [];

    const dayData = monthData.days.find(d => d.day === day);
    if (!dayData || !dayData.tasks) return [];

    const allTasks = $taskStore;
    return dayData.tasks
      .map(taskId => allTasks.find(t => t.id === taskId))
      .filter(task => task !== undefined) as Task[];
  }

  function generateCalendarDays(year: number, month: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date

    const days: CalendarDay[] = [];
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0);

    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
    const totalDaysInGrid = (firstDayOfWeek + lastDayOfMonth.getDate()) <= 35 ? 35 : 42;

    // Calculate starting day of the grid
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfWeek);

    for (let i = 0; i < totalDaysInGrid; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      date.setHours(0,0,0,0); // Normalize

      const dayTasks = getTasksForDay(date.getFullYear(), date.getMonth() + 1, date.getDate());

      days.push({
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        isCurrentMonth: date.getMonth() === month - 1 && date.getFullYear() === year,
        isToday: date.getTime() === today.getTime(),
        taskCount: dayTasks.length,
        tasks: dayTasks,
      });
    }
    calendarGridDays = days;
  }

  function previousMonth() {
    currentMonth -= 1;
    if (currentMonth < 1) {
      currentMonth = 12;
      currentYear -= 1;
    }
  }

  function nextMonth() {
    currentMonth += 1;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear += 1;
    }
  }

  function handleDayClick(day: CalendarDay) {
    if (!day.isCurrentMonth) return; // Optionally allow clicking days from other months
    dispatch('dayClicked', { year: day.year, month: day.month, day: day.day });
  }

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

</script>

<div class="monthly-log-view">
  <div class="month-navigation">
    <button on:click={previousMonth}>&lt; Prev</button>
    <h2>{monthName} {currentYear}</h2>
    <button on:click={nextMonth}>Next &gt;</button>
  </div>

  <div class="calendar-grid">
    {#each daysOfWeek as dayName}
      <div class="day-header">{dayName}</div>
    {/each}
    {#each calendarGridDays as calDay (calDay.year + '-' + calDay.month + '-' + calDay.day)}
      <div
        class="calendar-day"
        class:not-current-month={!calDay.isCurrentMonth}
        class:today={calDay.isToday}
        class:has-tasks={calDay.taskCount > 0}
        on:click={() => handleDayClick(calDay)}
        role="button"
        tabindex="0"
        on:keypress={(e) => e.key === 'Enter' && handleDayClick(calDay)}
      >
        <div class="day-number">{calDay.day}</div>
        {#if calDay.isCurrentMonth && calDay.taskCount > 0}
          <div class="task-indicator">{calDay.taskCount} task(s)</div>
          <!-- Alternatively, show dots or a small list -->
          <!-- <ul class="task-preview">
            {#each calDay.tasks.slice(0, 2) as task}
              <li>{task.description}</li>
            {/each}
            {#if calDay.tasks.length > 2}
              <li>...</li>
            {/if}
          </ul> -->
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .monthly-log-view {
    padding: 15px;
    border: 1px solid #ccc;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .month-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  .month-navigation h2 {
    margin: 0;
  }
  .month-navigation button {
    padding: 8px 12px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .month-navigation button:hover {
    background-color: #0056b3;
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 5px;
    border-top: 1px solid #eee;
    border-left: 1px solid #eee;
  }

  .day-header {
    font-weight: bold;
    text-align: center;
    padding: 8px;
    background-color: #f8f9fa;
    border-right: 1px solid #eee;
    border-bottom: 1px solid #eee;
  }
  .day-header:last-child {
     border-right: 1px solid #eee; /* Ensure right border for last header */
  }


  .calendar-day {
    min-height: 100px;
    padding: 8px;
    border-right: 1px solid #eee;
    border-bottom: 1px solid #eee;
    position: relative;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .calendar-day:hover {
    background-color: #f0f0f0;
  }

  .calendar-day.not-current-month {
    background-color: #f9f9f9;
    color: #aaa;
  }
  .calendar-day.not-current-month .day-number {
    color: #ccc;
  }
  .calendar-day.not-current-month:hover {
    background-color: #f9f9f9; /* No hover effect for non-current month days */
  }


  .calendar-day.today {
    background-color: #e6f7ff;
  }
  .calendar-day.today .day-number {
    font-weight: bold;
    color: #007bff;
  }

  .day-number {
    font-size: 1.2em;
    margin-bottom: 5px;
  }

  .task-indicator {
    font-size: 0.8em;
    background-color: #28a745;
    color: white;
    padding: 2px 5px;
    border-radius: 3px;
    display: inline-block;
  }
  .calendar-day.not-current-month .task-indicator {
    display: none; /* Hide task indicator for non-current month days */
  }

  /* Basic task preview styling (optional) */
  .task-preview {
    list-style: none;
    padding: 0;
    margin: 5px 0 0 0;
    font-size: 0.75em;
  }
  .task-preview li {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>

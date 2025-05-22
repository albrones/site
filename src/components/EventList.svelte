<script>
  import eventsData from '../events-bordeaux.json';
  const events = eventsData;
</script>

<ul>
  {#each events as event}
    <li>
      <h3>{event.title}</h3>
      <p>Date: {event.date}</p>
      <p>Location: {event.location}</p>
      <p>{event.description}</p>
    </li>
  {/each}
</ul>

<style>
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    border: 1px solid #eee;
    padding: 15px;
    margin-bottom: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Added a subtle box-shadow for better depth */
  }
  h3 {
    margin-top: 0;
    color: #333; /* Event title color */
    margin-bottom: 10px; /* Added some space below title */
  }
  p {
    margin-bottom: 5px;
    color: #666; /* Paragraph text color */
    line-height: 1.6; /* Improved readability */
  }
</style>

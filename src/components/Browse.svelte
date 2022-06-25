<script>
    import { onMount } from 'svelte';
    let programs = [];

    onMount(() => {
        fetch('http://localhost:3000/api/programs/programs')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                programs = data;
            });
    });
</script>

<h1>
    Browsing programs
</h1>

{#each programs as program (program.id)}
    <div class="program">
        <h2>
            {program.name}
        </h2>
        <p>
            {program.description}
        </p>
        <p>
            <a href="{program.url}">
                View program
            </a>
        </p>
    </div>
{/each}

<style>
    .program {
        border: 1px solid black;
        padding: 10px;
    }
</style>
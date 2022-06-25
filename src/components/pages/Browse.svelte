<script>
    import { onMount } from 'svelte';
    let programs = [];

    onMount(() => {
        fetch('http://localhost:3000/api/programs/programs')
            .then(response => response.json())
            .then(data => {
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
        padding: 10px;
    }
</style>
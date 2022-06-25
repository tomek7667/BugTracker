<script>
    import Header from './components/Header.svelte'
    import Login from "./components/Login.svelte";
    import Register from "./components/Register.svelte";
    import Home from "./components/Home.svelte";
    import Profile from "./components/Profile.svelte";
    import Browse from "./components/Browse.svelte";

    let menu = 1;
    let isLogged = false;
</script>

<Header />

<main>
    {#if menu === 1}
        <Home />
    {:else if menu === 2}
        <Browse />
    {:else if menu === 3}
        <Profile />
    {:else}
        <h1>
            Page Not Found
        </h1>
    {/if}
</main>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
</style>

<script>
    import Header from './components/Header.svelte'
    import Login from "./components/pages/Login.svelte";
    import Register from "./components/pages/Register.svelte";
    import Home from "./components/pages/Home.svelte";
    import Profile from "./components/pages/Profile.svelte";
    import Browse from "./components/pages/Browse.svelte";
    import PageNotFound from "./components/pages/PageNotFound.svelte";

    let menu = "home";
    let isLogged = false;
</script>

<Header bind:menu={menu} />

<main>
    {#if menu === "home"}
        <Home />
    {:else if menu === "browse"}
        <Browse />
    {:else if menu === "profile"}
        <Profile />
    {:else if menu === "login"}
        <Login />
    {:else if menu === "register"}
        <Register />
    {:else}
        <PageNotFound />
    {/if}
</main>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  main {
      padding: 10px;
  }
</style>

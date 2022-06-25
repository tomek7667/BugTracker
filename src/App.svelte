<script>
    import Notifications from 'svelte-notifications';
    import { getNotificationsContext } from 'svelte-notifications';
    const { addNotification } = getNotificationsContext()

    import Header from './components/Header.svelte'
    import Login from "./components/pages/Login.svelte";
    import Register from "./components/pages/Register.svelte";
    import Home from "./components/pages/Home.svelte";
    import Profile from "./components/pages/Profile.svelte";
    import Browse from "./components/pages/Browse.svelte";
    import PageNotFound from "./components/pages/PageNotFound.svelte";
    import {onMount} from "svelte";

    let menu = "home";
    let isLogged = false;
    let user;

    let notify = (message, type) => {
        addNotification({
            text: message,
            position: 'bottom-right',
            type: type,
            timeout: 3000,
            dismissible: true,
            dismissOnClick: true,
            pauseOnHover: true
        })
    }

    let verify = () => {
        return new Promise((resolve, reject) => {
            let token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
            if (token === null || token.length === 0) {
                isLogged = false;
                return reject();
            } else {
                // fetch verification from an api endpoint "/api/users/verify" passing the token in the body
                fetch("/api/users/verify", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        token: token
                    })
                })
                .then(res => res.json())
                .then(res => {
                    if (res.success) {
                        isLogged = true;
                        user = res.username;
                        return resolve();
                    } else {
                        isLogged = false;
                        return reject();
                    }
                })
                .catch(err => {
                    isLogged = false;
                    return reject();
                });
            }
        });
    }
    onMount(async () => {
        await verify();
    });
</script>

<Header bind:menu={menu} bind:isLogged={isLogged} bind:user={user} />
<Notifications>
<main>
    {#if menu === "home"}
        <Home />
    {:else if menu === "browse"}
        <Browse />
    {:else if menu === "profile"}
        <Profile />
    {:else if menu === "login"}
        <Login bind:menu={menu} bind:isLogged={isLogged} bind:user={user} />
    {:else if menu === "register"}
        <Register bind:menu={menu} bind:isLogged={isLogged} bind:user={user} />
    {:else}
        <PageNotFound />
    {/if}
</main>
</Notifications>
<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  main {
      padding: 10px;
  }
</style>

<script>
    import {onMount} from "svelte";
    export let menu;
    export let isLogged;
    export let user;
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
                    .catch(() => {
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


<h1>
    Profile
</h1>

<p>Hi {user}!</p>
<p>On this page you can set basic information about you!</p>

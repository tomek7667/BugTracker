<script>
    import { getNotificationsContext } from 'svelte-notifications';
    const { addNotification } = getNotificationsContext();

    export let isLogged;
    export let menu;
    export let user;
    let login = () => {
        let username = document.getElementById("username").value;
        let password = document.getElementById("password").value;
        // Post a login with fetch to "http://localhost:3000/api/users/login"
        fetch("/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        }).then(response => response.json())
        .then(data => {
            if (data.success) {
                isLogged = true;
                menu = "home";
                // Set a cookie to data.token
                document.cookie = "token=" + data.token;
                // Hide the login form
                document.getElementById("loginBox").style.display = "none";
                // Show the user's name
                user = username;
            } else {
                addNotification({
                    text: data.message,
                    position: 'bottom-right',
                    type: 'error',
                    timeout: 5000,
                    dismissible: true,
                    dismissOnClick: true,
                    pauseOnHover: true
                })
            }
        });
    };
</script>

<!-- Login form -->
<div class="wrapper" id="loginBox">
    <h1>Login</h1>
    <br>
    <form id="login" on:submit|preventDefault={login}>
        <label for="username">Username or e-mail:</label>
        <input type="text" id="username" name="username" />
        <br>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" />
        <br><br>
        <input type="submit" value="Login" />
    </form>
</div>

<style>
    /* Centered wrapper */
    .wrapper {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 400px;
        transform: translate(-50%, -50%);
    }
    /* Float right for input */
    input {
        float: right;
    }
    /* Style the submit button */
    input[type=submit] {
        background-color: #4f4f4f99;
        color: white;
        padding: 12px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: 0.1s;
    }
    input[type=submit]:hover {
        background-color: rgba(93, 92, 92, 0.6);
    }
</style>

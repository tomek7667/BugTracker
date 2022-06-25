<script>
    import { getNotificationsContext } from 'svelte-notifications';
    const { addNotification } = getNotificationsContext();

    export let isLogged;
    export let menu;
    export let user;
    let register = () => {
        let username = document.getElementById("username").value;
        let password = document.getElementById("password").value;
        let email = document.getElementById("email").value;
        fetch("http://localhost:3000/api/users/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password,
                email: email
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                isLogged = true;
                document.cookie = "token=" + data.token;
                user = username;
                menu = "home";
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

<!-- Register form -->
<div class="wrapper">
    <h1>Register</h1>
    <br>
    <form id="register" on:submit|preventDefault={register}>
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" />
        <br>
        <label for="username">Email:</label>
        <input type="text" id="email" name="email" />
        <br>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" />
        <br><br>
        <input type="submit" value="Register" />
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

<script>
    import {onMount} from "svelte";
    import { getNotificationsContext } from 'svelte-notifications';
    const { addNotification } = getNotificationsContext();

    export let menu;
    export let isLogged;
    export let user;
    let profileInformation = {};
    profileInformation.workplace = "";
    profileInformation.country = "";
    profileInformation.email = "";
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
        // Fetch profile information with "/api/users/getProfileInformation" endpoint passing the username and token in the body
        fetch("/api/users/getProfileInformation", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: user,
                token: document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")
            })
        })
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                profileInformation = {...profileInformation, ...res};
            } else {
                menu = "home";
                addNotification({
                    text: "Error fetching profile information",
                    position: 'bottom-right',
                    type: 'danger',
                    removeAfter: 3000,
                    dismissible: true,
                    pauseOnHover: true
                })
            }
        })
        .catch(() => {
            menu = "home";
            addNotification({
                text: "Error fetching profile information",
                position: 'bottom-right',
                type: 'danger',
                removeAfter: 3000,
                dismissible: true,
                pauseOnHover: true
            })
        });
        // Fetch user information with "/api/users/getUserInformation" endpoint passing the token in the body
        fetch("/api/users/getUserInformation", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token: document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")
            })
        })
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                profileInformation = {...profileInformation, ...res};
            } else {
                menu = "home";
                addNotification({
                    text: "Error fetching user information",
                    position: 'bottom-right',
                    type: 'danger',
                    removeAfter: 3000,
                    dismissible: true,
                    pauseOnHover: true
                })
            }
        })
    });
    let updateProfileInformation = () => {
        // Update profile information with fetch to "/api/users/updateProfileInformation" endpoint with token, email, workplace, description, country from DOM
        fetch("/api/users/updateProfileInformation", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token: document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1"),
                email: document.getElementById('profileEmail').value,
                workplace: document.getElementById('profileWorkplace').value,
                description: document.getElementById('profileDescription').value,
                country: document.getElementById('profileCountry').value
            })
        })
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                addNotification({
                    text: "Profile information updated",
                    position: 'bottom-right',
                    type: 'success',
                    removeAfter: 3000,
                    dismissible: true,
                    pauseOnHover: true
                })
            } else {
                addNotification({
                    text: res.message,
                    position: 'bottom-right',
                    type: 'danger',
                    removeAfter: 3000,
                    dismissible: true,
                    pauseOnHover: true
                })
            }
        })
    }
</script>
<h1>Profile</h1>
<h4>Hi <b>{user}</b>!</h4>
<p>On this page you can set basic information about you!</p>
{#if profileInformation.success}
    <hr>
    <h4>You currently have {profileInformation.stars}⭐.</h4>
    {#if profileInformation.isActivated === 0}
        <p><b>Your profile is not yet activated. Check your e-mail!</b></p>
    {:else if profileInformation.isActivated === 1}
        <p>Your profile is activated.</p>
    {/if}
    <p>Profile description:</p>
    <textarea id="profileDescription">{profileInformation.description}</textarea>
    <div class="profileWrapper">
        <span>Workplace: </span><input value="{profileInformation.workplace}" id="profileWorkplace">
        <span>Country: </span><input value="{profileInformation.country}" id="profileCountry">
        <span>E-mail: </span><input value="{profileInformation.email}" id="profileEmail">
    </div>
    <div class="updateInformationButton" on:click={updateProfileInformation}>Update information</div>
{/if}

<style>
    .profileWrapper {
        display: flex;
        flex-direction: column;
        justify-content: left;
        align-items: flex-start;
    }

    .updateInformationButton {
        float: right;
        background-color: #00bcd4;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 10px;
        margin: 10px 10px 10px 0;
        font-size: 20px;
        cursor: pointer;
    }

    .updateInformationButton:hover {
        background-color: #00acc1;
    }

    .updateInformationButton:active {
        background-color: #0097a7;
    }

    .updateInformationButton:focus {
        outline: none;
    }

    textarea {
        width: 75%;
        height: 200px;
        border: 1px solid #ccc;
        border-radius: 5px;
        resize: none;
        padding: 10px;
        font-size: 20px;
    }

    textarea:focus {
        outline: none;
    }

    textarea:hover {
        border: 1px solid #00bcd4;
    }

    textarea:active {
        border: 1px solid #00acc1;
    }

    textarea:focus {
        outline: none;
    }
</style>
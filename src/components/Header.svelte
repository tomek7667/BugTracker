<script>
    export let menu;
    export let isLogged;
    export let user;
    let isPrivateMenu = () => {
        if (
            menu === "profile" ||
            menu === "settings"
        ) return true;
        return false;
    }

    let logout = () => {
        // set document cookie token to null
        document.cookie = "token=;";
        isLogged = false;
        user = "";
        // If menu is not a public one, redirect to a homepage
        if (isPrivateMenu()) {
            menu = "home";
        }
    };
</script>

<img src="img/logo.png" class="logo" on:click={() => (menu = "home")} alt="Logo">

<div class="wrapper">
    <ul class="menu">
        <div class="onLeft">
            <li><a href="/" on:click|preventDefault={() => (menu = "home")}>Home</a></li> |
            <li><a href="/" on:click|preventDefault={() => (menu = "browse")}>Browse</a></li>
            {#if isLogged === true}
                | <li><a href="/" on:click|preventDefault={() => (menu = "profile")}>Profile</a></li>
            {/if}
        </div>
        <div class="onRight">
            <!-- Delete onClicks -->
        {#if isLogged === true}
            <li><span>Logged as {user}</span></li> |
            <li><a href="/" on:click|preventDefault={logout}>Logout</a></li>
        {:else}
            <li><a href="/" on:click|preventDefault={() => (menu = "register")}>Register</a></li> |
            <li><a href="/" on:click|preventDefault={() => (menu = "login")}>Login</a></li>
        {/if}
        </div>
    </ul>
</div>

<style>
    .logo {
        height: calc(52px - 20px);
        float: left;
        left: 10px;
        top: 10px;
        position: relative;
        cursor: pointer;
        transition: 0.2s;
    }

    .logo:hover {
        opacity: 0.5;
    }

    .onRight {
        float: right;
    }

    .onLeft {
        float: left;
    }

    .menu {
        margin-left: 10px;
    }

    ul.menu li{
        display: inline;
        width: 100%;
        height: 52px;
    }

    .wrapper {
        width: 100%;
        height: 52px;
        padding: 15px;
        background-color: #f5f5f5;
        border-bottom: 1px solid #e5e5e5;
    }
</style>


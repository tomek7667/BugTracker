<script>
    export let menu = 1;
    export let isLogged = false;
</script>

<img src="img/logo.png" class="logo" on:click={() => (menu = 1)}>
<div class="wrapper">
    <ul class="menu">
        <div class="onLeft">
            <li><a href="/" on:click|preventDefault={() => (menu = 1)}>Home</a></li> |
            <li><a href="/" on:click|preventDefault={() => (menu = 2)}>Browse</a></li> |
            <li><a href="/" on:click|preventDefault={() => (menu = 3)}>Profile</a></li>
        </div>
        <div class="onRight">
            <!-- Delete onClicks -->
        {#if isLogged === true}
            <li><a href="/" on:click|preventDefault={() => (isLogged = false)}>Logout</a></li>
        {:else}
            <li><a href="/" on:click|preventDefault={() => (isLogged = true)}>Register</a></li> |
            <li><a href="/" on:click|preventDefault={() => (isLogged = true)}>Login</a></li>
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


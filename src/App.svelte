<script>
	import Router, { replace, location } from 'svelte-spa-router';
	import Navbar from '@appComponents/Navbar/Navbar.svelte';
	import Toast from '@components/Toast/Toast.svelte';
	import { routes } from './routes/routes';
	import { login, logout } from '@models/user';
	import { token, is_logout } from '@stores/auth.store';
	import Loader from '@components/Loader/Loader.svelte';
    import { onMount } from "svelte";
	import { get } from 'svelte/store';
	import isEmpty from '@utils/is-empty';
	import { loader } from '@components/Loader/Loader';
	import { authorization } from '@stores/authorization.store';

	const initializeLogin = async () => {
		try{
			loader.show();
			await login();
			if ($location == '/login' || $location == '/') { 
				replace('/roots');
			}
		} catch (error){
			console.error("Error initializing authorization:", error);
			replace('/login');
		} finally{
			loader.hide();
		}
	}


	onMount(async() => {
		if (isEmpty(get(is_logout))) {
			await initializeLogin();
        } else {
			replace('/login');
        }
    });

	let conditionsFailed = async() => {
		if (!$token && isEmpty(get(is_logout))) {
			await initializeLogin();
		}
	};

</script>

<main class="page">
	{#if $token && !isEmpty($authorization?.authorizer)}
		<Navbar />
		<Router {routes} on:conditionsFailed={conditionsFailed} />
	{:else}
		<Router {routes} on:conditionsFailed={conditionsFailed} />
	{/if}
</main>
<Toast />
<Loader />

<style>
	.page {
		display: flex;
		width: 100%;
		height: 100%;
		overflow-x: hidden;
		overflow-y: auto;
	}
</style>

<script>
	import { loader } from './Loader';
	import CircularLoader from '@components/CircularLoader/index.svelte';
</script>

{#if $loader}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="loader-overlay" on:click|stopPropagation|preventDefault>
		<CircularLoader />
	</div>
{/if}

<style src="./style.scss">
</style>

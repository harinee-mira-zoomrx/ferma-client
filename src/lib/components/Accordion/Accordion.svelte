<script>
	import { slide } from 'svelte/transition';
	import { Icon } from '@smui/icon-button';

	export let open = false;

	const handleClick = () => (open = !open);
</script>

<div class="accordian">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="accordian__header" on:click={handleClick}>
		<div class="accordian__header-text">
			<slot name="header"></slot>
		</div>
		<div class="accordian__header-action">
			<Icon
				class="material-icons"
			>
				{open ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
			</Icon>
		</div>
	</div>
	{#if open}
		<div class="accordian__details" transition:slide>
			<slot name="details"></slot>
		</div>
	{/if}
</div>

<style src="./style.scss"></style>

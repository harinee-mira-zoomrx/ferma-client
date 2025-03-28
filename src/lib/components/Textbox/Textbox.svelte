<script>
	import { onMount } from 'svelte';

	export let value = '';
	export let inputValue = '';
	export let label = null;
	export let width = null;
	export let name = null;
	let textbox;
	onMount(() => {
		if (width) {
			textbox.style.width = width;
		}
	});
</script>

<div class="input" bind:this={textbox}>
	{#if label}
		<div class="input__label">
			{label}
		</div>
	{/if}
	<div class="input__content">
		{value || 'NA'}
		{#if name}
			<input type="hidden" {name} value={inputValue} />
		{/if}
	</div>
</div>

<style lang="scss">
	.input {
		display: flex;
		align-self: flex-start;
		flex-direction: column;
		min-width: 300px;
		width: 300px;

		&__label {
			display: flex;
			align-self: flex-start;
			justify-content: flex-start;
			font-size: 12px;
			color: #8b8b8b;
		}
	}
	.input__content {
		outline: none;
		min-height: 30px;
		color: #454545;
		border-radius: 6px;
		padding: 0px 10px 5px 0px;
	}
</style>

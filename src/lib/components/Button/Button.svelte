<script>
	// @ts-nocheck
	export let type = '';
	export let buttonType = 'button';
	export let name = null;
	export let disabled = false;
	export let onClick = () => {};
</script>

<button
	class="btn"
	class:btn--primary={type === 'primary'}
	class:btn--secondary={type === 'secondary'}
	class:btn--cautious-primary={type === 'cautious-primary'}
	class:btn--cautious-secondary={type === 'cautious-secondary'}
	class:btn--link={type === 'link'}
	class:btn--disabled={disabled}
	type={buttonType}
	{disabled}
	on:click={onClick}
>
	{#if name}
		{name}
	{:else}
		<slot />
	{/if}
</button>

<style src="./style.scss"></style>

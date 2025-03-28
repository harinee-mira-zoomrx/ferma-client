<script>
	import { link } from 'svelte-spa-router';
	import active from 'svelte-spa-router/active';
	import IconButton from '@smui/icon-button';

	export let path = '/';
	export let label = '';
	export let activePath = '';
	export let iconName = null;
	export let collapsed = false;

	let showTooltip = false;
</script>

<div class="nav-item-wrapper">
<!-- svelte-ignore a11y-missing-attribute -->
	<a
		class="nav-item"
		use:link={path}
		use:active={activePath || path}
		on:mouseenter={() => showTooltip = true}
		on:mouseleave={() => showTooltip = false}
	>
		{#if iconName}
			<IconButton
				class="material-icons"
				ripple={false}
			>
				{iconName}
			</IconButton>
		{/if}
		{#if !collapsed}
			<span>{label}</span>
		{/if}
	</a>

	{#if showTooltip && collapsed}
		<div class="tooltip">{label}</div>
	{/if}
</div>

<style src="./style.scss"></style>

<script>
	import active from 'svelte-spa-router/active';
	import { slide } from 'svelte/transition';
	import IconButton, { Icon } from '@smui/icon-button';

	export let label = '';
	export let activePath = '';
	export let iconName = null;
	export let collapsed = false; // Add this line
	export let setCollapsed;

	let showMenu = false;
	let showTooltip = false;

	const toggleMenu = () => {
		if (collapsed) {
			setCollapsed(false);
		}
		showMenu = !showMenu;
	};
</script>

<div class="sub-menu">
	<a
		class="sub-menu__overview"
		use:active={activePath}
		on:click={toggleMenu}
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
			<span>{label}</span> <!-- Hide this when collapsed -->
		{/if}
		<Icon class="material-icons mdc-icon-button mdc-icon-button--display-flex expand-icon">
			{showMenu ? 'expand_less' : 'expand_more'}
		</Icon>
	</a>
	{#if showTooltip && collapsed}
		<div class="tooltip">{label}</div>
	{/if}
	{#if showMenu && !collapsed}
		<div class="sub-menu__items" transition:slide={{ duration: 300 }}>
			<slot />
		</div>
	{/if}
</div>

<style src="./style.scss"></style>

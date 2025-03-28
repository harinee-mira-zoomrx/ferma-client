<script>
	import { onMount } from 'svelte';
	import { Icon } from '@smui/icon-button';

	export let tabs = [];
	export let activeTab = tabs[0];
	export let onClick = null;

	onMount(() => {
		activeTab = tabs[0];
	});
</script>

<div class="tabs-container">
	{#each tabs as tab}
		{#if !tab.hide}
			<button
				class="tab"
				class:tab--active={activeTab === tab}
				class:tab--warning={tab.showWarning === true}
				on:click={() => {
					activeTab = tab;
					if (typeof onClick === 'function') {
						onClick(tab);
					}
				}}
			>
				{tab?.label || tab}
				{#if tab.showWarning}
					<Icon
						class="material-icons mdc-icon-button mdc-icon-button--display-flex warning-icon"
					>
					warning
					</Icon>
				{/if}
			</button>
		{/if}
	{/each}
</div>

<style src="./style.scss"></style>

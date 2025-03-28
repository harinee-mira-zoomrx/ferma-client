<script>
	import { Icon } from '@smui/icon-button';
	export let actions = [];
	export let rowData;
	export let data;
</script>

<div class="datatable-actions">
	{#each actions as action}
		{#if !action.key || (action.key && rowData[action.key])}
			{@const disabled = action.disableIf && action.disableIf(rowData)}
			<div class="action-btn {disabled ? 'action-btn--disabled' : ''}">
				<Icon
					class="material-icons mdc-icon-button mdc-icon-button--display-flex mdc-ripple-upgraded--unbounded {disabled
						? 'mdc-icon-button--disabled'
						: ''}"
					title={action.title || action.iconName}
					on:click={() => action.handler(rowData)}
				>
					<div class="mdc-icon-button__ripple" />
					{action.iconName}
				</Icon>
				{#if rowData[action.key]}
					{rowData[action.key]}
				{/if}
			</div>
		{:else}
			{'NA'}
		{/if}
	{/each}
</div>

<style>
	.datatable-actions {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 2px;
	}
</style>

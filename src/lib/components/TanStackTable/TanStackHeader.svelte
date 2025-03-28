<script>
	import Input from '@components/Input/Input.svelte';
	import Selectbox from '@components/Selectbox/Selectbox.svelte';
	import { Icon } from '@smui/icon-button';
	import { getCommonPinningStyles } from './TanStackUtils';

	export let headerGroup;
</script>

{#each headerGroup.headers as header}
	<th
		data-density={header.getDensity()}
		style="padding: var(--header-padding); min-width: {header.getSize()}px; max-width: {header.getSize()}px; {getCommonPinningStyles(
			header.column
		)};"
	>
		<div class="header">
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div
				class={'header__title ' +
					(header.column.getCanSort() ? 'cursor-pointer' : '')}
				on:click={header.column.getToggleSortingHandler()}
			>
				{header.column.columnDef.header}

				{#if header.column.getIsSorted().toString() === 'asc'}
					<Icon
						class="material-icons mdc-icon-button mdc-icon-button--display-flex mdc-ripple-upgraded--unbounded"
						title="ascending"
					>
						arrow_drop_down
					</Icon>
				{:else if header.column.getIsSorted().toString() === 'desc'}
					<Icon
						class="material-icons mdc-icon-button mdc-icon-button--display-flex mdc-ripple-upgraded--unbounded"
						title="ascending"
					>
						arrow_drop_up
					</Icon>
				{/if}
			</div>

			{#if header.column.getCanFilter()}
				{#if header.column.columnDef.meta?.filterVariant === 'select'}
					<Selectbox
						placeholder="Select"
						items={header.column.columnDef.meta?.filterOptions}
						onSelect={(e) =>
							header.column.setFilterValue(e.detail?.value)}
						onClear={(e) => header.column.setFilterValue(undefined)}
						clearable={header.column.columnDef.clearable ?? true}
						clearFilterTextOnBlur={true}
						value={header.column.getFilterValue()?.toString()}
						width="100%"
					/>
				{:else}
					<Input
						type={header.column.columnDef.meta?.filter?.type ||
							'text'}
						placeholder={`Filter ${header.column.columnDef.header}`}
						value={header.column.getFilterValue()?.toString() || ''}
						additionalProps={header.column.columnDef.meta?.filter
							?.additionalProps || {}}
						onInput={(e) =>
							header.column.setFilterValue(e.currentTarget.value)}
					/>
				{/if}
			{/if}
		</div>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			on:dblclick={() => header.column.resetSize()}
			on:mousedown={header.getResizeHandler()}
			on:touchstart={header.getResizeHandler()}
			class={`resizer ${header.column.getIsResizing() ? 'resizing' : ''}`}
		/>
	</th>
{/each}

<style lang="scss">
	th {
		position: relative;
		border: 1px solid #ddd;
		padding: 8px;
		background-color: #fff;
		text-align: left;
		min-width: fit-content;
		vertical-align: baseline;
	}
	.header {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		--width: 100%;

		&__title {
			display: flex;
			height: 32px;
			justify-content: space-between;
			align-items: center;
		}
	}

	.filter-input {
		margin-top: 5px;
		padding: 5px;
		font-size: 14px;
		width: 100%;
	}

	.loader {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
	.resizer {
		background: rgba(0, 0, 0, 0);
		cursor: col-resize;
		height: 100%;
		position: absolute;
		right: -3px;
		top: 0;
		touch-action: none;
		user-select: none;
		width: 4px;
	}
	.resizer:hover {
		background: rgba(0, 0, 0, 0.5);
	}
	.resizing {
		background: rgba(0, 0, 0, 0.5);
	}
	.cursor-pointer {
		cursor: pointer;
	}
</style>

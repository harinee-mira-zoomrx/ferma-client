<script>
	import { flexRender } from '@tanstack/svelte-table';
	import { getCommonPinningStyles } from './TanStackUtils';

	export let cell;
	export let row;
	const renderComponent = cell.column.columnDef.meta?.renderComponent;
	const table = cell.getContext().table;
</script>

{#if row.getIsGrouped()}
	{#if cell.getIsGrouped()}
		<td
			class="grouped-cell"
			on:click={row.getToggleExpandedHandler()}
			style="cursor: {row.getCanExpand() ? 'pointer' : 'normal'};"
		>
			{row.getIsExpanded() ? '▼' : '►'}
			{cell.column.columnDef.cell(cell) || 'Group'}
		</td>
	{:else}
		<td class="grouped-cell"></td>
	{/if}
{:else if renderComponent}
	<td
		data-density={table.getDensity()}
		style="padding: var(--cell-padding); {getCommonPinningStyles(
			cell.column
		)}"
	>
		<svelte:component
			this={flexRender(renderComponent.component, {
				rowData: row.original,
                data: cell.column.columnDef.cell(cell),
				...renderComponent.props,
			})}
		/>
	</td>
{:else}
	<td
		class:wrap-text={cell.column.columnDef.meta?.wrapText}
		data-density={table.getDensity()}
		title={cell.column.columnDef.cell(cell)}
		style="padding: var(--cell-padding); {getCommonPinningStyles(
			cell.column
		)}"
	>
		{cell.column.columnDef.cell(cell)}
	</td>
{/if}

<style lang="scss">
	td {
		border: 1px solid #ddd;
		padding: 8px;
		background: #fff;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 200px;
		text-align: left;
		vertical-align: bottom;

		&.wrap-text {
			overflow: unset;
			text-overflow: unset;
			white-space: unset;
		}
        &.grouped-cell {
            border-left: none;
            border-right: none;
        }
	}
</style>

<script>
	// @ts-nocheck
	import Input from '@components/Input/Input.svelte';
	import Selectbox from '@components/Selectbox/Selectbox.svelte';
	import IconButton from '@smui/icon-button';

	export let table;
	export let rowCount;
	export let currentRowCount;
</script>

<div class="pagination">
	<div class="pagination__toggles">
		<IconButton
			class="material-icons"
			ripple={false}
			on:click={() => $table.setPageIndex(0)}
			disabled={!$table.getCanPreviousPage()}
		>
			keyboard_double_arrow_left
		</IconButton>
		<IconButton
			class="material-icons"
			ripple={false}
			on:click={() => $table.previousPage()}
			disabled={!$table.getCanPreviousPage()}
		>
			keyboard_arrow_left
		</IconButton>
		<IconButton
			class="material-icons"
			ripple={false}
			on:click={() => $table.nextPage()}
			disabled={!$table.getCanNextPage() ||
				(rowCount && currentRowCount >= rowCount)}
		>
			keyboard_arrow_right
		</IconButton>
		<IconButton
			class="material-icons"
			ripple={false}
			on:click={() =>
				$table.setPageIndex(
					~~(rowCount / $table.getState().pagination.pageSize)
				)}
			disabled={!$table.getCanNextPage() ||
				!rowCount ||
				currentRowCount >= rowCount}
		>
			keyboard_double_arrow_right
		</IconButton>
	</div>
	<span class="pagination__page_details">
		[
		{$table.getState().pagination.pageIndex *
			$table.getState().pagination.pageSize} -
		{$table.getState().pagination.pageIndex *
			$table.getState().pagination.pageSize +
			$table.getRowModel().rows.length}
		]
	</span>

	<span class="pagination__actions">
		PAGE SIZE:
		<Selectbox
			items={['10', '25', '50', '100']}
			value={{
				value: '' + $table.getState().pagination.pageSize,
				label: '' + $table.getState().pagination.pageSize,
			}}
			width="50"
			searchable={false}
			onSelect={(e) => {
				$table.setPageSize(Number(e.detail.value));
			}}
		/>
	</span>
</div>

<style lang="scss">
	.pagination {
		background-color: #fff;
		padding: 10px;
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 25px;
		border: 1px solid #ddd;
		border-top: none;
		min-height: 52px;
		font-size: 14px;
		padding-right: 30px;

		&__actions {
			display: flex;
			align-items: center;
			gap: 10px;
			font-size: 12px;
		}
		&__toggles {
			display: flex;
		}
		&__page_details {
			min-width: 100px;
			text-align: center;
		}
	}
</style>

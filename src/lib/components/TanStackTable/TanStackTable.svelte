<script>
	import {
		createSvelteTable,
		getCoreRowModel,
		getFilteredRowModel,
		getSortedRowModel,
		getGroupedRowModel,
		getExpandedRowModel,
		getPaginationRowModel,
	} from '@tanstack/svelte-table';
	import CircularLoader from '@components/CircularLoader/index.svelte';
	import { writable } from 'svelte/store';
	import { debounce, queryConstructor } from '@utils/utility.js';
	import TanStackHeader from './TanStackHeader.svelte';
	import { onMount, tick } from 'svelte';
	import { DensityFeature } from './TanStackCustomFeatures';
	import TanStackTableHeaderToolbar from './TanStackTableHeaderToolbar.svelte';
	// @ts-ignore
	import TanStackPagination from './TanStackPagination.svelte';
	import TanStackCell from './TanStackCell.svelte';
	import { customFilterFns, processDatatableFilters } from './TanStackUtils';
	import createDatatableStore from '@stores/datatableConfigStore';

	export let columns = [];
	export let disablePagination = false;
	// {left: [...ids], right: [...ids]}
	export let columnPinning = {};
	// {id: string,desc: boolean}[]
	export let sorting = [];
	export let pagination = { pageIndex: 0, pageSize: 10 };
	// {id: string, value: string}[]
	export let columnFilters = [];
	export let datasource = { getRows: (params) => {} };
	export let enableServerSideRowModel = true;
	export let grouping = [];
	export let excludeFilterQuery = [];
	export let enableGlobalFilter = true;
	export let configStorageKey = '';
	export const refreshDatatable = async () => {
		await loadData(true, true);
	};
	const configStore = createDatatableStore(configStorageKey, {});

	let data = [];
	let datatable;
	let columnVisibility = $configStore?.visible_columns || {};
	let isLoading = false;
	let density = 'md';
	let globalFilter = '';
	let paginationReset = false;
	let rowCount = null;
	let currentRowCount = 0;

	if ($configStore?.column_order) {
		let columnsMapping = new Map(
			columns.map((columnDef) => [columnDef.accessorKey, columnDef])
		);
		columns = [
			...$configStore?.column_order
				.map((id) => {
					const col = columnsMapping.get(id);
					columnsMapping.delete(id);
					return col;
				})
				.filter((column) => column),
			...Array.from(columnsMapping, ([name, value]) => value),
		];
	}

	const getDataModel = () => ({
		successCallback: (rows, rowCountData = false) => {
			data = rows;
			if (typeof rowCountData === 'boolean') {
				rowCount = !rowCountData
					? pagination.pageIndex * pagination.pageSize + rows.length
					: null;
			} else if (typeof rowCountData === 'number') {
				rowCount = rowCountData;
			} else {
				rowCount = null;
			}
			currentRowCount =
				($table.getState().pagination.pageIndex + 1) *
				$table.getState().pagination.pageSize;
		},
		failCallback: () => {},
		searchQuery: globalFilter,
		filterModel: columnFilters,
		sortModel: sorting,
		sortQuery: sorting.length
			? `${sorting[0]?.id}:${sorting[0]?.desc ? 'desc' : 'asc'}`
			: '',
		filterQuery: queryConstructor(
			processDatatableFilters(columnFilters, $table, excludeFilterQuery)
		),
		page: pagination.pageIndex + 1,
		size: pagination.pageSize,
	});

	onMount(async () => {
		await loadData(false, true);
		if (!enableServerSideRowModel && disablePagination) {
			$table.setPagination(() => ({
				pageSize: data.length,
				pageIndex: 0,
			}));
		}
	});
	const loadData = async (resetPage, clientReRendering = false) => {
		if (resetPage) {
			paginationReset = true;
			$table.setPageIndex(0);
		}
		if (!enableServerSideRowModel && !clientReRendering) {
			return;
		}
		await tick();
		isLoading = true;
		if (
			document.activeElement &&
			datatable?.contains(document.activeElement)
		) {
			document.activeElement.blur();
		}
		try {
			await datasource.getRows(getDataModel());
		} finally {
			isLoading = false;
		}
	};

	const options = writable({
		_features: [DensityFeature],
		data,
		columns,
		filterFns: customFilterFns,
		globalFilterFn: 'startsWith',
		defaultColumn: {
			cell: (info) =>
				info.getValue() === '' ? '-' : (info.getValue() ?? '-'),
			sortUndefined: -1,
			size: 200,
			maxSize: 800,
			minSize: 100,
			filterFn: 'startsWith',
			enableColumnFilter: false,
			enableSorting: false,
		},
		state: {
			columnFilters,
			columnVisibility,
			pagination,
			density,
			globalFilter,
			grouping,
		},
		initialState: { columnPinning, columnFilters, sorting },
		sortDescFirst: true,
		enableSortingRemoval: false,
		pageCount: disablePagination ? 1 : -1,
		manualPagination: enableServerSideRowModel,
		manualSorting: enableServerSideRowModel,
		manualFiltering: enableServerSideRowModel,
		columnResizeMode: 'onChange',
		enableColumnResizing: true,
		enableGlobalFilter,
		getPaginationRowModel: getPaginationRowModel(),
		getGroupedRowModel: getGroupedRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: debounce(async (setColumnFilters) => {
			columnFilters = setColumnFilters(columnFilters);
			await loadData(true);
		}, 450),
		onSortingChange: async (setSort) => {
			sorting = setSort(sorting);
			await loadData(true);
		},
		onColumnVisibilityChange: (setColumnVisibility) => {
			columnVisibility = setColumnVisibility(columnVisibility);
			saveConfig();
		},
		onColumnOrderChange: (columnsData) => {
			columns = [...new Set(columnsData)];
			saveConfig();
		},
		onPaginationChange: async (setPaginationState) => {
			if (paginationReset) {
				paginationReset = false;
				return;
			}
			pagination = setPaginationState(pagination);
			await loadData();
		},
		onDensityChange: (setDensity) => {
			density = setDensity(density);
		},
		onGroupingChange: (setGrouping) => {
			grouping = setGrouping(grouping);
		},
		onGlobalFilterChange: debounce(async (globalFilterData) => {
			globalFilter = globalFilterData;
			await loadData();
		}, 450),
	});

	$: options.update((opts) => ({
		...opts,
		data,
		columns,
		state: {
			...opts?.state,
			columnFilters,
			columnVisibility,
			pagination,
			sorting,
			density,
			globalFilter,
			grouping,
		},
	}));

	const saveConfig = () => {
		if (configStorageKey) {
			const column_order = [
				...new Set(
					$table
						.getAllLeafColumns()
						// @ts-ignore
						.map((col) => col.columnDef?.accessorKey)
				),
			];
			configStore.updateTable({
				column_order,
				visible_columns: columnVisibility,
			});
		}
	};

	// @ts-ignore
	const table = createSvelteTable(options);
</script>

<div class="datatable" bind:this={datatable}>
	<div class="datatable__content">
		{#if isLoading}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div class="loader" on:click|preventDefault|stopPropagation>
				<CircularLoader />
			</div>
		{/if}
		<TanStackTableHeaderToolbar {table}>
			<slot name="table-actions-right" slot="table-actions-right" />
			<slot name="table-actions-left" slot="table-actions-left" />
		</TanStackTableHeaderToolbar>
		<table>
			<thead>
				<tr>
					{#each $table.getHeaderGroups() as headerGroup (headerGroup.id)}
						<TanStackHeader {headerGroup} />
					{/each}
				</tr>
			</thead>
			<tbody>
				{#if !$table.getRowModel().rows.length}
					<tr>
						<td colspan={columns.length}>
							{@html isLoading ? '&nbsp;' : 'No data found'}
						</td>
					</tr>
				{:else}
					{#each $table.getRowModel().rows as row (row.id)}
						<tr>
							{#each row.getVisibleCells() as cell (cell.id)}
								<TanStackCell {cell} {row} />
							{/each}
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
		{#if !disablePagination}
			<TanStackPagination {table} {rowCount} {currentRowCount} />
		{/if}
	</div>
</div>

<style src="./style.scss"></style>

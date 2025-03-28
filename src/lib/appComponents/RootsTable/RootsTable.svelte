<script>
	import Datatable from '@components/Datatables/Datatable.svelte';
	import Router, { location, push, querystring } from 'svelte-spa-router';
	import { createEventDispatcher } from 'svelte';
	import { fetchRootsDataTable } from '@models/roots.js';
	import { onMount } from 'svelte';
	import { Pagination } from '@smui/data-table';
	import { queryConstructor } from '@utils/utility.js';
	import { toasts } from '@components/Toast/toasts';
	import isEmpty from '@utils/is-empty';
	import { VERIFICATION_STATUS } from '@utils/constants';
	import { transformSnakeToCapitalized } from '@utils/utility';
	import { ROOT_LABELS } from '@models/roots';

	let roots = [];
	let isDatatableLoading = false;
	let hasNext = false;
	let page = 1;
	let size = 10;
	let searchTerm = '';
	let sortBy = 'id:desc';
	let columnSearchQuery = [];
	const dispatch = createEventDispatcher();
	let columns = [
		{
			label: 'Actions',
			value: 'ACTION',
			actions: [
				{
					iconName: 'edit',
					title: 'edit',
					handler: (row) => {
						// Open new tab
						window.open(`#/roots/${row.id}`, '_blank');
					},
				},
			],
			width: 40,
		},

		{
			label: 'Root ID',
			value: 'id',
			tableName: 'id',
			sortable: true,
			searchable: true,
			width: 60,
		},
		{
			label: 'Root Name',
			value: 'name',
			tableName: 'name',
			sortable: true,
			searchable: true,
			width: 100,
		},
		{
			label: 'Label',
			value: 'label',
			tableName: 'label',
			searchable: true,
			searchType: 'SELECT',
			searchOptions: Object.values(ROOT_LABELS).map((label) => {
				return {
					label,
					value: label,
				};
			}),
			width: 100,
		},
		{
			label: 'Synonyms',
			value: 'synonyms_name',
			tableName: 'synonym_name',
			searchable: true,
			width: 200,
		},
		{
			label: 'Overall Verification Status',
			value: 'overall_status',
			tableName: 'overall_status',
			transformContent: (record) =>
				`${transformSnakeToCapitalized(record.overall_status)}`,
			searchable: true,
			searchType: 'SELECT',
			searchOptions: Object.values(VERIFICATION_STATUS).map((status) => {
				return {
					label: transformSnakeToCapitalized(status),
					value: status,
				};
			}),
			width: 110,
		},
	];

	onMount(async () => {
		await fetchRootsListData();
	});

	const fetchRootsListData = async (searchTerm = '') => {
		try {
			isDatatableLoading = true;
			let queryParam = [...columnSearchQuery];
			const overallStatusFilter = queryParam.find(
				(query) => query.key === 'overall_status'
			);
			if (overallStatusFilter) {
				queryParam = queryParam.filter(
					(query) => query.key !== 'overall_status'
				);
			}
			let options = {
				page,
				size,
				search: searchTerm || '',
				query: queryConstructor(queryParam),
				sort_by: sortBy,
			};
			if (overallStatusFilter) {
				options = {
					...options,
					overall_status: overallStatusFilter.value,
				};
			}
			[roots, hasNext] = await fetchRootsDataTable(options);
		} catch (error) {
			console.warn(error);
			roots = [];
			hasNext = false;
			toasts.error(error);
		} finally {
			isDatatableLoading = false;
		}
		return roots;
	};

	const onRootsListFilter = async (e) => {
		page = 1;
		await fetchRootsListData(searchTerm);
	};

	const onSort = (e) => {
		const sortDirection =
			e.detail.sortValue === 'ascending' ? 'asc' : 'desc';
		sortBy = `${e.detail.columnId}:${sortDirection}`;
		page = 1;
		fetchRootsListData(searchTerm);
	};

	const refreshDatatable = async () => {
		await fetchRootsListData(searchTerm);
	};

	const getSort = () => {
		if (!isEmpty(sortBy)) {
			return sortBy.split(':')[0];
		}
		return '';
	};
	const getSortDirection = () => {
		if (!isEmpty(sortBy)) {
			const direction = sortBy.split(':')[1];
			return direction === 'asc' ? 'ascending' : 'descending';
		}
		return '';
	};
</script>

<div class="data-reviewer__datatable datatable">
	<div class="datatable__content">
		<Datatable
			{columns}
			{hasNext}
			loading={isDatatableLoading}
			disableGlobalSearch={true}
			sort={getSort()}
			sortDirection={getSortDirection()}
			handleSort={onSort}
			handlefilter={onRootsListFilter}
			toggleColumns={true}
			data={roots}
			bind:searchTerm
			bind:columnSearchQuery
			bind:rowsPerPage={size}
			bind:currentPage={page}
			onPageChange={() => fetchRootsListData(searchTerm)}
			configStorageKey="roots_table"
			keyedEachIndex="id"
		/>
		<Pagination />
	</div>
</div>

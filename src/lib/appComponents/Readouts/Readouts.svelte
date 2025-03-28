<script>
	import Datatable from '@components/Datatables/Datatable.svelte';
	import { onMount } from 'svelte';
	import { queryConstructor } from '@utils/utility.js';
	import { Pagination } from '@smui/data-table';
	import { toasts } from '@components/Toast/toasts';
	import isEmpty from '@utils/is-empty';
	import {
		fetchReadouts,
		READOUT_SOURCE_TYPE,
		READOUT_SOURCE_NAME,
		READOUT_CATEGORY,
	} from '@models/readouts';
	import Link from '@appComponents/CellComponents/Link.svelte';
	import { VERIFICATION_STATUS } from '@utils/constants';
	import { transformSnakeToCapitalized } from '@utils/utility';

	let isDatatableLoading = false;
	let hasNext = false;
	let page = 1;
	let size = 10;
	let searchTerm = '';
	let sortBy = 'id:desc';
    let readouts= [];
    let columnSearchQuery = [];

	$: columns = [
		{
			label: 'ID',
			value: 'id',
			tableName: 'id',
			searchable: true,
			sortable: true,
			width: 175,
		},
		{
			label: 'Year',
			value: 'year',
			tableName: 'year',
			searchable: true,
			sortable: true,
			width: 175,
		},
		{
			label: 'Source Type',
			value: 'source_type',
			tableName: 'source_type',
			searchable: true,
			sortable: true,
			searchType: 'SELECT',
			searchOptions: Object.values(READOUT_SOURCE_TYPE).map( type => {
				return {
					label: type,
					value: type,
				}
			}),
		},
		{
			label: 'Source Name',
			value: 'source_name',
			tableName: 'source_name',
			searchable: true,
			sortable: true,
			searchType: 'SELECT',
			searchOptions: Object.values(READOUT_SOURCE_NAME).map( name => {
				return {
					label: name,
					value: name,
				}
			}),
		},
		{
			label: 'Entity Id',
			value: 'entity_id',
			tableName: 'entity_id',
			searchable: true,
			sortable: true,
			cellComponent: Link,
			cellComponentProps: (row) => ({
				data: row.entity_id,
				href: row.verification_url ?? row.url,
			}),
		},
		{
			label: 'Source URL',
			value: 'url',
			tableName: 'url',
			searchable: true,
			sortable:true,
            cellComponent: Link,
		},
		{
			label: 'Category',
			value: 'category',
			tableName: 'category',
			searchable: true,
			sortable: true,
			searchType: 'SELECT',
			searchOptions: Object.values(READOUT_CATEGORY).map( name => {
				return {
					label: name,
					value: name,
				}
			}),
		},
		{
			label: 'Results Stage',
			value: 'results_stage',
			tableName: 'results_stage',
			searchable: true,
			sortable: true,
		},
		{
			label: 'Results Stage Root ID',
			value: 'results_stage_root_id',
			tableName: 'results_stage_root_id',
			searchable: true,
			sortable: true,
			cellComponent: Link,
			cellComponentProps: (row) => ({
				data: row.results_stage_root_id,
				href: `#/roots/${row.results_stage_root_id}`,
			}),
		},
		{
			label: 'Results Stage Root Name',
			value: 'results_stage_root_name',
			tableName: 'results_stage_root_name',
			searchable: true,
			sortable: true,
			cellComponent: Link,
			cellComponentProps: (row) => ({
				data: row.results_stage_root_name,
				href: `#/roots/${row.results_stage_root_id}`,
			}),
		},
		{
			label: 'Trial Identifier',
			value: 'trial_identifier',
			tableName: 'trial_identifier',
			searchable: true,
			sortable: false,
		},
		{
			label: 'Trial Acronym',
			value: 'trial_acronym',
			tableName: 'trial_acronym',
			searchable: true,
			sortable: false,
		},
		{
			label: 'Study ID',
			value: 'study_id',
			tableName: 'study_id',
			searchable: true,
			sortable: false,
		},
		{
			label: 'Verification Status',
			value: 'verification_status',
			tableName: 'verification_status',
			searchable: true,
			sortable: true,
			searchType: 'SELECT',
			searchOptions: Object.values(VERIFICATION_STATUS).map((status) => {
				return {
					label: transformSnakeToCapitalized(status),
					value: status,
				};
			}),
		},
		{
			label: 'Actions',
			value: 'ACTION',
			actions: [
				{
					iconName: 'visibility',
					title:'view',
					handler: (row) => {
						window.open(`#/readouts/${row.id}`, '_blank');
					},
				},
			],
		},
	];

	onMount(async () => {
		await fetchReadoutsData();
	});


	const fetchReadoutsData = async (searchTerm = '') => {
		try {
			isDatatableLoading = true;
			let queryParam = [...columnSearchQuery];
			[readouts, hasNext] = await fetchReadouts({
				page,
				size,
				search: searchTerm || '',
				query: queryConstructor(queryParam),
				sort_by: sortBy
			});
		} catch (error) {
			console.warn(error);
			readouts = [];
			hasNext = false;
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			isDatatableLoading = false;
		}
		return readouts;
	};

	const onFilter = async (e) => {
		page = 1;
		await fetchReadoutsData(searchTerm);
	};

	const onSort = (e) => {
		const sortDirection =
			e.detail.sortValue === 'ascending' ? 'asc' : 'desc';
		sortBy = `${e.detail.columnId}:${sortDirection}`;
		page = 1;
		fetchReadoutsData(searchTerm);
	};

	const getSort = () => {
		if(!isEmpty(sortBy)) {
			return sortBy.split(":")[0];
		}
		return '';
	}
	const getSortDirection = () => {
		if(!isEmpty(sortBy)) {
			const direction = sortBy.split(":")[1];
			return direction === 'asc' ? 'ascending' : 'descending';
		}
		return '';
	}
</script>

<div class="data-reviewer__datatable datatable">
	<div class="datatable__content">
		<Datatable
			{columns}
			{hasNext}
			loading={isDatatableLoading}
			sort={getSort()}
			sortDirection={getSortDirection()}
			handleSort={onSort}
			handlefilter={onFilter}
			data={readouts}
			disableGlobalSearch = {true}
			bind:searchTerm
			bind:columnSearchQuery
			bind:rowsPerPage={size}
			bind:currentPage={page}
			onPageChange={() => fetchReadoutsData(searchTerm)}
		/>
		<Pagination />
	</div>
</div>

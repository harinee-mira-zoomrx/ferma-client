<script>
	import Datatable from '@components/Datatables/Datatable.svelte';
	import { queryConstructor } from '@utils/utility';
	import { onMount } from 'svelte';
	import { toasts } from '@components/Toast/toasts';
	import {
		fetchAllWorkflows,
		WORKFLOW_NAME,
		WORKFLOW_ENTITY_TYPE,
		WORKFLOW_STATUS,
	} from '@models/workflow';
	import isEmpty from '@utils/is-empty';

	let workflows = [];
	let page = 1;
	let size = 10;
	let hasNext = false;
	let searchTerm = '';
	let isDatatableLoading = false;
	let sortBy = 'id:desc';
	let columnSearchQuery = [];
	let columns = [
		{
			label: 'Id',
			value: 'id',
			tableName: 'id',
			sortable: true,
			searchable: true,
		},
		{
			label: 'Name',
			value: 'name',
			tableName: 'name',
			sortable: true,
			searchable: true,
			searchType: 'SELECT',
			searchOptions: WORKFLOW_NAME,
		},
		{
			label: 'Entity Type',
			value: 'entity_type',
			tableName: 'entity_type',
			sortable: true,
			searchable: true,
			searchType: 'SELECT',
			searchOptions: WORKFLOW_ENTITY_TYPE,
		},
		{
			label: 'Entity Id',
			value: 'entity_id',
			tableName: 'entity_id',
			sortable: true,
			searchable: true,
		},
		{
			label: 'Status',
			value: 'status',
			tableName: 'status',
			sortable: true,
			searchable: true,
			searchType: 'SELECT',
			searchOptions: WORKFLOW_STATUS,
		},
		{
			label: 'Created At',
			value: 'created_at',
			tableName: 'created_at',
			sortable: true,
			searchable: true,
		},
		{
			label: 'Modified At',
			value: 'modified_at',
			tableName: 'modified_at',
			sortable: true,
			searchable: true,
		},
	];

	onMount(async () => {
		await fetchWorkflows();
	});
	const fetchWorkflows = async (searchTerm = '') => {
		try {
			let queryParam = [...columnSearchQuery];
			isDatatableLoading = true;
			[workflows, hasNext] = await fetchAllWorkflows({
				page,
				size,
				search: searchTerm || '',
				query: queryConstructor(queryParam),
				sort_by: sortBy,
			});
		} catch (error) {
			console.warn(error);
			workflows = [];
			hasNext = false;
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			isDatatableLoading = false;
		}
		return workflows;
	};
	const onWorkflowsSort = async (e) => {
		const sortDirection =
			e.detail.sortValue === 'ascending' ? 'asc' : 'desc';
		sortBy = `${e.detail.columnId}:${sortDirection}`;
		page = 1;
		await fetchWorkflows(searchTerm);
	};
	const onWorkflowsFilter = async (e) => {
		page = 1;
		await fetchWorkflows(searchTerm);
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

<section>
	<div class="datatable">
		<Datatable
			{columns}
			{hasNext}
			loading={isDatatableLoading}
			data={workflows}
			sort={getSort()}
			sortDirection={getSortDirection()}
			handleSort={onWorkflowsSort}
			handlefilter={onWorkflowsFilter}
			bind:searchTerm
			bind:columnSearchQuery
			bind:rowsPerPage={size}
			bind:currentPage={page}
			onPageChange={() => fetchWorkflows(searchTerm)}
			onGlobalSearch={fetchWorkflows}
		/>
	</div>
</section>

<style src="./style.scss"></style>

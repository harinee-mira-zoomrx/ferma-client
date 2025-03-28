<script>
	import Datatable from '@components/Datatables/Datatable.svelte';
	import { fetchTrialsWorkflow }from '@models/trialsWorkflow';
	import { INSIGHT_STATUS , CATEGORY} from '@models/insightsMaster';
	import { onMount } from 'svelte';
	import { queryConstructor } from '@utils/utility.js';
	import { Pagination } from '@smui/data-table';
	import { toasts } from '@components/Toast/toasts';
	import EditModal from './EditModal.svelte';
	import { push } from 'svelte-spa-router';
	import isEmpty from '@utils/is-empty';
	import Link from '@appComponents/CellComponents/Link.svelte';

	let trials = [];
	let isDatatableLoading = false;
	let hasNext = false;
	let page = 1;
	let size = 10;
	let searchTerm = '';
	let columnSearchQuery = [];
	let showEditModal = false;
	let selectedRow;
	let sortBy = 'insight_id:desc';

	let columns = [
		{
			label: 'Insight ID',
			value: 'insight_id',
			tableName: 'insight_id',
			searchable: true,
			sortable: true,
		},
		{
			label: 'NCT ID',
			value: 'NCT_id',
			tableName: 'NCT_id',
			searchable: true,
			cellComponent: Link,
			cellComponentProps: (row) => ({
				data: row.NCT_id,
				href: `#/trials/${row.NCT_id}`,
			}),
		},
		{
			label: 'Insight Category',
			value: 'insight_category',
			tableName: 'insight_category',
			searchable: true,
			searchType: 'SELECT',
			searchOptions: CATEGORY,
		},
		{
			label: 'Content Source URL',
			value: 'content_source_url',
			tableName: 'content_source_url',
			cellComponent: Link,
		},
		{
			label: 'Trial Acronym',
			value: 'trial_acronym',
			tableName: 'trial_acronym',
			searchable: true,
		},
		{
			label: 'Trial Phase',
			value: 'trial_phase',
			tableName: 'trial_phase',
			searchable: true,
		},
		{
			label: 'Trial Status',
			value: 'trial_status',
			tableName: 'trial_status',
			searchable: true,
		},
		{
			label: 'Trial Workflow Status',
			value: 'workflow_category_trial',
			tableName: 'workflow_category_trial',
			searchable: true,
			searchType: 'SELECT',
			searchOptions: INSIGHT_STATUS,
		},
		{
			label: 'Actions',
			value: 'ACTION',
			actions: [
				{
					iconName: 'visibility',
					title:'view',
					handler: (row) => {
						window.open(`#/data-reviewer/trials-workflow/insights/${row.insight_id}`, '_blank');
					},
				},
			],
		},
	];

	onMount(async () => {
		await fetchTrialsWorkflowData();
	});

	const splitSearchQuery = () => {
    	let modifiedQuery = [];
    	let workflowCategory = {};
    	columnSearchQuery.forEach((query) => {
        	if (query.key.includes('workflow_category')) {
				workflowCategory[query.key] = query.value;
        	} else {
            	modifiedQuery.push(query);
        	}
    	});
    	return [modifiedQuery, workflowCategory];
	};

	const fetchTrialsWorkflowData = async (searchTerm = '') => {
		try {
			isDatatableLoading = true;
			let [modifiedQuery, workflowCategory] = splitSearchQuery();
        	let queryParam = [...modifiedQuery];
			let options = {
            	page,
            	size,
            	search: searchTerm || '',
            	query: queryConstructor(queryParam),
				sort_by: sortBy,
        	};
			if(!isEmpty(workflowCategory)){
				options = {...options, workflow_category: JSON.stringify(workflowCategory)}
			}
			[trials, hasNext] = await fetchTrialsWorkflow(options);
		} catch (error) {
			console.warn(error);
			trials = [];
			hasNext = false;
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			isDatatableLoading = false;
		}

		return trials;
	};

	const onTrialsWorkflowFilter = async (e) => {
		page = 1;
		await fetchTrialsWorkflowData(searchTerm);
	};

	const toggleEditModal = () => {
		showEditModal = !showEditModal;
	};

	const refreshDatatable = async () => {
		await fetchTrialsWorkflowData(searchTerm);
	};

	const onSort = (e) => {
		const sortDirection =
			e.detail.sortValue === 'ascending' ? 'asc' : 'desc';
		sortBy = `${e.detail.columnId}:${sortDirection}`;
		page = 1;
		fetchTrialsWorkflowData(searchTerm);
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
			disableGlobalSearch = {true}
			sort={getSort()}
			sortDirection={getSortDirection()}
			handleSort={onSort}
			handlefilter={onTrialsWorkflowFilter}
			toggleColumns={true}
			data={trials}
			bind:searchTerm
			bind:columnSearchQuery
			bind:rowsPerPage={size}
			bind:currentPage={page}
			onPageChange={() => fetchTrialsWorkflowData(searchTerm)}
			configStorageKey="trials_workflow"
		/>
		<Pagination />
	</div>
</div>
{#if showEditModal}
<EditModal
	{refreshDatatable}
	data={selectedRow}
	onClose={toggleEditModal}
/>
{/if}
<script>
	import Datatable from '@components/Datatables/Datatable.svelte';
	import { fetchFirmsWorkfow, IS_PHARMA_COMPANY } from '@models/firmsWorkflow';
	import { CATEGORY, INSIGHT_STATUS } from '@models/insightsMaster';
	import { onMount } from 'svelte';
	import { queryConstructor } from '@utils/utility.js';
	import { Pagination } from '@smui/data-table';
	import { toasts } from '@components/Toast/toasts';
	import EditModal from './EditModal.svelte';
	import { push } from 'svelte-spa-router';
	import isEmpty from '@utils/is-empty';
	import Link from '@appComponents/CellComponents/Link.svelte';
	import { ORGANIZATION_STAGE } from '@models/organization.js';

	let firms = [];
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
			label: 'Organization',
			value: 'organization',
			tableName: 'organization',
			searchable: true,
		},
		{
			label: 'Organization Stage',
			value: 'organization_stage',
			tableName: 'organization_stage',
			searchable: true,
			searchType: 'SELECT',
			searchOptions: Object.values(ORGANIZATION_STAGE).map(key => {
				return {
					label: key,
					value: key,
				}
			}),
		},
		{
			label: 'Parent Organization',
			value: 'parent_organization',
			tableName: 'parent_organization',
			searchable: true,
		},
		{
			label: 'Stock Exchange',
			value: 'stock_exchange',
			tableName: 'stock_exchange',
			searchable: true,
		},
		{
			label: 'Stock Ticker',
			value: 'stock_ticker',
			tableName: 'stock_ticker',
			searchable: true,
		},
		{
			label: 'Is Pharma Company',
			value: 'is_pharma_company',
			tableName: 'is_pharma_company',
			searchable: true,
			searchType: 'SELECT',
			searchOptions: IS_PHARMA_COMPANY,
		},
		{
			label: 'Firm Workflow Status',
			value: 'workflow_category_firm',
			tableName: 'workflow_category_firm',
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
						window.open(`#/data-reviewer/firms-workflow/insights/${row.insight_id}`, '_blank');
					},
				},
			],
		},
	];

	onMount(async () => {
		await fetchFirmsWorkflowData();
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

	const fetchFirmsWorkflowData = async (searchTerm = '') => {
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
			[firms, hasNext] = await fetchFirmsWorkfow(options);
		} catch (error) {
			console.warn(error);
			firms = [];
			hasNext = false;
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			isDatatableLoading = false;
		}

		return firms;
	};

	const onFirmsWorkflowFilter = async (e) => {
		page = 1;
		await fetchFirmsWorkflowData(searchTerm);
	};

	const toggleEditModal = () => {
		showEditModal = !showEditModal;
	};

	const refreshDatatable = async () => {
		await fetchFirmsWorkflowData(searchTerm);
	};

	const onSort = (e) => {
		const sortDirection =
			e.detail.sortValue === 'ascending' ? 'asc' : 'desc';
		sortBy = `${e.detail.columnId}:${sortDirection}`;
		page = 1;
		fetchFirmsWorkflowData(searchTerm);
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
			handlefilter={onFirmsWorkflowFilter}
			toggleColumns={true}
			data={firms}
			bind:searchTerm
			bind:columnSearchQuery
			bind:rowsPerPage={size}
			bind:currentPage={page}
			onPageChange={() => fetchFirmsWorkflowData(searchTerm)}
			configStorageKey="firms_workflow"
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
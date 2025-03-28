<script>
	import Datatable from '@components/Datatables/Datatable.svelte';
	import { fetchInsightsMaster, CATEGORY , INSIGHT_STATUS, fetchJSON} from '@models/insightsMaster';
	import { SOURCE_TYPE } from '@models/contents';
	import { onMount } from 'svelte';
	import {  queryConstructor } from '@utils/utility.js';
	import { Pagination } from '@smui/data-table';
	import { toasts } from '@components/Toast/toasts';
	import EditModal from './EditModal.svelte';
	import isEmpty from '@utils/is-empty';
	import downloadFileUsingBlob from '@utils/downloadFileUsingBlob';
	import Link from '@appComponents/CellComponents/Link.svelte';
	import FullContent from '@appComponents/CellComponents/FullContent.svelte';

	let insights = [];
	let isDatatableLoading = false;
	let hasNext = false;
	let page = 1;
	let size = 10;
	let searchTerm = '';
	let sortBy = 'id:desc';
	let columnSearchQuery = [];
	let showEditModal = false;
	let selectedRow;

	let columns = [
		{
			label: 'ID',
			value: 'id',
			tableName: 'id',
			searchable: true,
			sortable:true,
			width: 175,
		},
		{
			label: 'Content ID',
			value: 'content_id',
			tableName: 'content_id',
			searchable: true,
			sortable:true,
			width: 175,
		},
		{
			label: 'Content Source Type',
			value: 'content_source_type',
			tableName: 'content_source_type',
			searchable: true,
			sortable:true,
			searchType: 'SELECT',
			searchOptions: SOURCE_TYPE,
		},
		{
			label: 'Content Source URL',
			value: 'content_source_url',
			tableName: 'content_source_url',
			searchable: true,
			sortable:true,
			cellComponent: Link,
		},
		{
			label: 'Category',
			value: 'category',
			tableName: 'category',
			searchable: true,
			sortable:true,
			searchType: 'SELECT',
			searchOptions: CATEGORY,
		},
		{
			label: 'Insight',
			value: 'insight',
			tableName: 'insight',
			searchable: true,
			sortable:true,
			cellComponent:FullContent,
			width: 475,
		},
		{
			label: 'KG Workflow Status',
			value: 'workflow_category_kg',
			tableName: 'workflow_category_kg',
			searchable: true,
			searchType: 'SELECT',
			searchOptions: INSIGHT_STATUS,
			width: 175,
		},
		{
			label: 'Firm Workflow Status',
			value: 'workflow_category_firm',
			tableName: 'workflow_category_firm',
			searchable: true,
			searchType: 'SELECT',
			searchOptions: INSIGHT_STATUS,
			width: 175,
		},
		{
			label: 'Drug Workflow Status',
			value: 'workflow_category_drug',
			tableName: 'workflow_category_drug',
			searchable: true,
			searchType: 'SELECT',
			searchOptions: INSIGHT_STATUS,
			width: 175,
		},
		{
			label: 'Trial Workflow Status',
			value: 'workflow_category_trial',
			tableName: 'workflow_category_trial',
			searchable: true,
			searchType: 'SELECT',
			searchOptions: INSIGHT_STATUS,
			width: 175,
		},
		{
			label: 'Actions',
			value: 'ACTION',
			actions: [
				{
					iconName: 'download',
					handler: (row) => {
						handleDownload(row.id)
					},
				}
			],
		},
	]

	onMount(async () => {
		await fetchInsightsMasterData();
	});

	const toggleEditModal = () => {
		showEditModal = !showEditModal;
	};

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

	const fetchInsightsMasterData = async (searchTerm = '') => {
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
       	 	[insights, hasNext] = await fetchInsightsMaster(options);
   	 	} catch (error) {
      	  	console.warn(error);
        	insights = [];
       	 	hasNext = false;
        	toasts.error(error.message || 'An unexpected error occurred.');
    	} finally {
        	isDatatableLoading = false;
   		}
    	return insights;
	};

	const onInsightsMasterFilter = async (e) => {
		page = 1;
		await fetchInsightsMasterData(searchTerm);
	};

	const onSort = (e)=>{
		const sortDirection =
			e.detail.sortValue === 'ascending' ? 'asc' : 'desc';
		sortBy = `${e.detail.columnId}:${sortDirection}`;
		page = 1;
	    fetchInsightsMasterData(searchTerm);
	}

	const refreshDatatable = async () => {
		await fetchInsightsMasterData(searchTerm);
	};

	const handleDownload = async (id) => {
		try {
			const data = await fetchJSON(id);
			downloadFileUsingBlob(
				new Blob([JSON.stringify(data)], { type: 'application/json' }),
				`insights-${id}.json`
			);
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		}
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
			handlefilter={onInsightsMasterFilter}
			toggleColumns={true}
			data={insights}
			bind:searchTerm
			bind:columnSearchQuery
			bind:rowsPerPage={size}
			bind:currentPage={page}
			onPageChange={() => fetchInsightsMasterData(searchTerm)}
			onGlobalSearch={fetchInsightsMasterData}
			configStorageKey="insights_workflow"
		/>
		<Pagination/>
	</div>
</div>

{#if showEditModal}
<EditModal
	{refreshDatatable}
	data={selectedRow}
	onClose={toggleEditModal}
/>
{/if}

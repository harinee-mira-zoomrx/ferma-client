<script>
	import Datatable from '@components/Datatables/Datatable.svelte';
	import { fetchContents, downloadJSON ,SOURCE_TYPE,DOCUMENT_COMPLEXITY, CONTENT_STATUS} from '@models/contents';
	import { onMount } from 'svelte';
	import {  queryConstructor } from '@utils/utility.js';
	import { Pagination } from '@smui/data-table';
	import { toasts } from '@components/Toast/toasts';
	import downloadFileUsingBlob from '@utils/downloadFileUsingBlob';
	import isEmpty from '@utils/is-empty';
	import Link from '@appComponents/CellComponents/Link.svelte';

	export let isFileUploaded = false;

	const ELIGIBLE_STATUS_FOR_DOWNLOAD = ['CONTENT_EXTRACTION_COMPLETE'];
	let contents = [];
	let isDatatableLoading = false;
	let hasNext = false;
	let page = 1;
	let size = 10;
	let searchTerm = '';
	let sortBy = 'id:desc';
	let columnSearchQuery = [];

	let columns = [
		{
			label: 'ID',
			value: 'id',
			tableName: 'id',
			searchable: true,
			sortable:true,
		},
		{
			label: 'Source URL',
			value: 'source_url',
			tableName: 'source_url',
			searchable: true,
			sortable:true,
			cellComponent: Link,
		},
		{
			label: 'Source Type',
			value: 'source_type',
			tableName: 'source_type',
			searchable: true,
			sortable:true,
			searchType: 'SELECT',
			searchOptions: SOURCE_TYPE,
		},
		{
			label: 'Title',
			value: 'title',
			tableName: 'title',
			searchable: true,
			sortable:true,
		},
		{
			label: 'Author',
			value: 'author',
			tableName: 'author',
			searchable: true,
			sortable:true,
		},
		{
			label: 'Published On',
			value: 'published_on',
			tableName: 'published_on',
			searchable: true,
			sortable:true,
		},
		{
			label: 'Provider',
			value: 'provider',
			tableName: 'provider',
			searchable: true,
			sortable:true,
		},
		{
			label: 'Document Complexity',
			value: 'document_complexity',
			tableName: 'document_complexity',
			searchable: true,
			sortable:true,
			searchType: 'SELECT',
			searchOptions: DOCUMENT_COMPLEXITY,
		},
		{
			label: 'Extension',
			value: 'extension',
			tableName: 'extension',
			searchable: true,
			sortable:true,
		},
		{
			label: 'Filing Period',
			value: 'filing_period',
			tableName: 'filing_period',
			searchable: true,
			sortable:true,
		},
		{
			label: 'Pages',
			value: 'pages',
			tableName: 'pages',
			searchable: true,
			sortable:true,
		},
		{
			label: 'Status',
			value: 'status',
			tableName: 'status',
			searchable: true,
			sortable:true,
			searchType: 'SELECT',
			searchOptions: CONTENT_STATUS,
		},
		{
			label: 'Tags',
			value: 'tags',
			tableName: 'tags',
			searchable: true,
			sortable:true,
		},
		{
			label: 'Uploaded By',
			value: 'uploaded_by',
			tableName: 'uploaded_by',
			searchable: true,
			sortable:true,
		},	
		{
			label: 'Created At',
			value: 'created_at',
			tableName: 'created_at',
			searchable: true,
			sortable:true,
		},	
		{
			label: 'Modified At',
			value: 'modified_at',
			tableName: 'modified_at',
			searchable: true,
			sortable:true,
		},	
		{
			label: 'Action',
			value: 'ACTION',
			actions: [
				{
					iconName: 'download',
					handler: (actionEvent) => {
						handleDownload(actionEvent.id)
					},
					disableIf: (actionEvent) => {
						return !ELIGIBLE_STATUS_FOR_DOWNLOAD.includes(actionEvent.status);
					}
				}
			],
		},
	]

	onMount(async () => {
		await fetchContentsData();
	});
	const fetchContentsData = async (searchTerm = '') => {
		try {
			isDatatableLoading = true;
			let queryParam = [...columnSearchQuery];
			[contents, hasNext] = await fetchContents({
				page,
				size,
				search: searchTerm || '',
				query: queryConstructor(queryParam),
				sort_by: sortBy
			});
		} catch (error) {
			console.warn(error);
			contents = [];
			hasNext = false;
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			isDatatableLoading = false;
		}

		return contents;
	};

	const onContentsFilter = async (e) => {
		page = 1;
		await fetchContentsData(searchTerm);
	};

	const handleDownload = async (id) => {
		try {
			const data = await downloadJSON(id);
			downloadFileUsingBlob(
				new Blob([JSON.stringify(data)], { type: 'application/json' }),
				`extracted-text-${id}.json`
			);
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		}
	};

	$: if (isFileUploaded) {
		isFileUploaded = false;
		fetchContentsData();
	}

	const onContentsSort = (e)=>{
		const sortDirection =
			e.detail.sortValue === 'ascending' ? 'asc' : 'desc';
		sortBy = `${e.detail.columnId}:${sortDirection}`;
		page = 1;
	    fetchContentsData(searchTerm);
	}

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
			handleSort={onContentsSort}
			handlefilter={onContentsFilter}
			toggleColumns={true}
			data={contents}
			bind:searchTerm
			bind:columnSearchQuery
			bind:rowsPerPage={size}
			bind:currentPage={page}
			onPageChange={() => fetchContentsData(searchTerm)}
			onGlobalSearch={fetchContentsData}
			configStorageKey="contents_workflow"
		/>
		<Pagination/>
	</div>
</div>

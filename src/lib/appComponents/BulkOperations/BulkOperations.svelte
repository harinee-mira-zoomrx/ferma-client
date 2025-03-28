<script>
	import Datatable from '@components/Datatables/Datatable.svelte';
	import { fetchBackgroundProcess } from '@models/bulkOperations.js';
	import { onMount } from 'svelte';
	import { debounce, queryConstructor } from '@utils/utility.js';
	import { Pagination } from '@smui/data-table';
	import { downloadFile } from '@utils/api.js';
	import { toasts } from '@components/Toast/toasts';

	export let isFileUploaded = false;

	let backgroundProcess = [];
	let isDatatableLoading = false;
	let hasNext = false;
	let page = 1;
	let size = 10;
	let searchTerm = '';
	let columnSearchQuery = [];

	let columns = [
		{
			label: 'Id',
			value: 'id',
			tableName: 'id',
			searchable: true,
		},

		{
			label: 'Bulk Event',
			value: 'event',
			tableName: 'event',
			searchable: true,
		},
		{
			label: 'Input File',
			value: 'input_file',
			file: true,
			actions: [
				{
					iconName: 'download',
					handler: (actionEvent) => {
						handleDownload(actionEvent.input_file)
					},
					key: 'input_file'
				}
			],
		},
		{
			label: 'Output File',
			value: 'output_file',
			file: true,
			actions: [
				{
					iconName: 'download',
					handler: (actionEvent) => {
						handleDownload(actionEvent.output_file)
					},
					key: 'output_file'
				}
			],
		},
		{
			label: 'Status',
			value: 'status',
			tableName: 'status',
			searchable: true,
		},
		{
			label: 'Triggered By',
			value: 'triggered_by',
			tableName: 'triggered_by',
			searchable: true,
		},
		{
			label: 'Timestamp',
			value: 'modified_at',
			tableName: 'modified_at',
			searchable: true,
		},
	]

	onMount(async () => {
		await fetchBackgroundProcessData();
	});
	const fetchBackgroundProcessData = async (searchTerm = '') => {
		try {
			isDatatableLoading = true;
			let queryParam = [...columnSearchQuery];
			[backgroundProcess, hasNext] = await fetchBackgroundProcess({
				page,
				size,
				search: searchTerm || '',
				query: queryConstructor(queryParam),
				sort_by: 'id:desc'
			});
		} catch (error) {
			console.warn(error);
			backgroundProcess = [];
			hasNext = false;
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			isDatatableLoading = false;
		}

		return backgroundProcess;
	};

	const onBackgroundProcessFilter = async (e) => {
		page = 1;
		await fetchBackgroundProcessData(searchTerm);
	};

	const handleDownload = async (file_name) => {
		await downloadFile(`/background_process/download_file`, {
			file_name: file_name,
			is_cloud_file: true
		})
	}

	$: if (isFileUploaded) {
		isFileUploaded = false;
		fetchBackgroundProcessData();
	}
</script>

<div class="bulk-operations__datatable datatable">
	<div class="datatable__content">
		<Datatable
			{columns}
			{hasNext}
			loading={isDatatableLoading}
			handlefilter={onBackgroundProcessFilter}
			data={backgroundProcess}
			bind:searchTerm
			bind:columnSearchQuery
			bind:rowsPerPage={size}
			bind:currentPage={page}
			onPageChange={() => fetchBackgroundProcessData(searchTerm)}
			onGlobalSearch={fetchBackgroundProcessData}
		/>
		<Pagination/>
	</div>
</div>

<style src="./style.scss"></style>

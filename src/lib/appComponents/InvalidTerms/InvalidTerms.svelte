<script>
	import Datatable from '@components/Datatables/Datatable.svelte';
	import { onMount } from 'svelte';
	import { queryConstructor } from '@utils/utility.js';
	import { toasts } from '@components/Toast/toasts';
	import isEmpty from '@utils/is-empty';
	import { fetchInvalidTerms } from '@models/invalidTerms';
	import { downloadFile } from '@utils/api.js';

	let isDatatableLoading = false;
	let hasNext = false;
	let page = 1;
	let size = 10;
	let searchTerm = '';
	let sortBy = '';
	let invalidTerms = [];
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
			label: 'Term',
			value: 'term',
			tableName: 'term',
			searchable: true,
			sortable: true,
		},
		{
			label: 'Parent Root ID',
			value: 'parent_root_id',
			tableName: 'parent_root_id',
			searchable: true,
			sortable: true,
		},
		{
			label: 'Deleted Term Mappings',
			value: 'ACTION',
			actions: [
				{
					iconName: 'download',
					handler: (actionEvent) => {
						handleDownload(actionEvent.deleted_term_mappings)
					},
					key: 'deleted_term_mappings'
				}
			],
		},
		{
			label: 'Invalidated By',
			value: 'invalidated_by',
			tableName: 'invalidated_by',
			searchable: true,
			sortable: true,
		},
	];

	onMount(async () => {
		await fetchInvalidTermsData();
	});

	const fetchInvalidTermsData = async (searchTerm = '') => {
		try {
			isDatatableLoading = true;
			let queryParam = [...columnSearchQuery];
			[invalidTerms, hasNext] = await fetchInvalidTerms({
				page,
				size,
				search: searchTerm || '',
				query: queryConstructor(queryParam),
				sort_by: sortBy
			});
		} catch (error) {
			console.warn(error);
			invalidTerms = [];
			hasNext = false;
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			isDatatableLoading = false;
		}
		return invalidTerms;
	};

	const onFilter = async (e) => {
		page = 1;
		await fetchInvalidTermsData(searchTerm);
	};

	const onSort = (e) => {
		const sortDirection =
			e.detail.sortValue === 'ascending' ? 'asc' : 'desc';
		sortBy = `${e.detail.columnId}:${sortDirection}`;
		page = 1;
		fetchInvalidTermsData(searchTerm);
	};

	const getSort = () => {
		if (!isEmpty(sortBy)) {
			return sortBy.split(":")[0];
		}
		return '';
	};

	const getSortDirection = () => {
		if (!isEmpty(sortBy)) {
			const direction = sortBy.split(":")[1];
			return direction === 'asc' ? 'ascending' : 'descending';
		}
		return '';
	};

	const handleDownload = async (file_name) => {
		await downloadFile(`/invalid_terms/download_file`, {
			file_name: file_name,
		})
	}
</script>

<div class="datatable">
	<div class="datatable__content">
		<Datatable
			{columns}
			{hasNext}
			loading={isDatatableLoading}
			sort={getSort()}
			sortDirection={getSortDirection()}
			handleSort={onSort}
			handlefilter={onFilter}
			data={invalidTerms}
			disableGlobalSearch={true}
			bind:searchTerm
			bind:columnSearchQuery
			bind:rowsPerPage={size}
			bind:currentPage={page}
			onPageChange={() => fetchInvalidTermsData(searchTerm)}
		/>
	</div>
</div>

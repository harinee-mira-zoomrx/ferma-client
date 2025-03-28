<script>
	import Datatable from '@components/Datatables/Datatable.svelte';
	import { fetchStudiesList } from '@models/studies.js';
	import { onMount } from 'svelte';
	import { Pagination } from '@smui/data-table';
	import { queryConstructor } from '@utils/utility.js';
	import { toasts } from '@components/Toast/toasts';
	import isEmpty from '@utils/is-empty';
	import { VERIFICATION_STATUS } from '@utils/constants.js';
	import { transformSnakeToCapitalized } from '@utils/utility';
	import Alert from '@components/Alert/Alert.svelte';

	let studies = [];
	let isDatatableLoading = false;
	let hasNext = false;
	let page = 1;
	let size = 10;
	let searchTerm = '';
	let sortBy = 'nct_id:asc';
	let columnSearchQuery = [];
	let columns = [
		{
			label: 'Actions',
			value: 'ACTION',
			actions: [
				{
					iconName: 'edit',
					handler: (row) => {
						window.open(`#/trials/${row.nct_id}`, '_blank');
					},
				}
			],
			width: 80
		},
		{
			label: 'NCT_ID',
			value: 'nct_id',
			tableName: 'nct_id',
			searchable: true,
			sortable:true,
			width: 140
		},
		{
			label: 'Study ID',
			value: 'study_id',
			tableName: 'study_id',
			searchable: true,
			width: 100
		},
		{
			label: 'Acronym',
			value: 'acronym',
			tableName: 'acronym',
			searchable: true,
			width: 200
		},
		{
			label: 'Indication',
			value: 'indication',
			tableName: 'indication',
			searchable: true,
			width: 200
		},
		{
			label: 'Disease',
			value: 'disease',
			tableName: 'disease',
			searchable: true,
			width: 200
		},
		{
			label: 'Therapy Area',
			value: 'therapy_area',
			tableName: 'therapy_area',
			searchable: true,
			width: 200
		},
		{
			label: 'Primary Drug',
			value: 'primary_drug',
			tableName: 'primary_drug',
			searchable: true,
			width: 200
		},
		{
			label: 'Secondary Drug',
			value: 'secondary_drug',
			tableName: 'secondary_drug',
			searchable: true,
			width: 200
		},
		{
			label: 'Comparator Drug',
			value: 'comparator_drug',
			tableName: 'comparator_drug',
			searchable: true,
			width: 200
		},
		{
			label: 'Sponsors',
			value: 'sponsor',
			tableName: 'sponsor',
			searchable: true,
			width: 200
		},
		{
			label: 'Collaborators',
			value: 'collaborator',
			tableName: 'collaborator',
			searchable: true,
			width: 200
		},
		{
			label: 'Trial Status',
			value: 'trial_verification_status',
			tableName: 'trial_verification_status',
			transformContent: (record) =>
				`${transformSnakeToCapitalized(record.trial_verification_status)}`,
			searchable: true,
			searchType: 'SELECT',
			searchOptions: Object.values(VERIFICATION_STATUS)
				.map( status => {
				return {
					label: transformSnakeToCapitalized(status),
					value: status,
				}
			}),
			width: 200
		},
		{
			label: 'Readout Studies ID',
			value: 'readout_studies_id',
			tableName: 'readout_studies_id',
			searchable: true,
			width: 200
		},
		{
			label: 'Readout Status',
			value: 'readout_verification_status',
			tableName: 'readout_verification_status',
			transformContent: (record) =>
				`${transformSnakeToCapitalized(record.readout_verification_status)}`,
			searchable: true,
			searchType: 'SELECT',
			searchOptions: Object.values(VERIFICATION_STATUS)
				.map( status => {
					return {
						label: transformSnakeToCapitalized(status),
						value: status,
					}
				}),
			width: 200
		},
	]

	onMount(async () => {
		await fetchStudiesListData();
	});

	const fetchStudiesListData = async (searchTerm = '') => {
		try {
			isDatatableLoading = true;
			let queryParam = [...columnSearchQuery];
			let options = {
				page,
				size,
				search: searchTerm || '',
				query: queryConstructor(queryParam),
				sort_by: sortBy,
			};
			[studies, hasNext] = await fetchStudiesList(options);
		} catch (error) {
			console.warn(error);
			studies = [];
			hasNext = false;
			toasts.error(error);
		} finally {
			isDatatableLoading = false;
		}
		return studies;
	};

	const onStudiesListFilter = async (e) => {
		page = 1;
		await fetchStudiesListData(searchTerm);
	};

	const onSort = (e)=>{
		const sortDirection =
			e.detail.sortValue === 'ascending' ? 'asc' : 'desc';
		sortBy = `${e.detail.columnId}:${sortDirection}`;
		page = 1;
		fetchStudiesListData(searchTerm);
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
			disableGlobalSearch = {true}
			sort={getSort()}
			sortDirection={getSortDirection()}
			handleSort={onSort}
			handlefilter={onStudiesListFilter}
			toggleColumns={true}
			data={studies}
			bind:searchTerm
			bind:columnSearchQuery
			bind:rowsPerPage={size}
			bind:currentPage={page}
			onPageChange={() => fetchStudiesListData(searchTerm)}
			configStorageKey="studies_table"
			keyedEachIndex="nct_id"
		/>
		<Pagination/>
		<Alert
			severity="info"
			message="Cumulative search across columns not applicable for - Indication, Disease, Therapy Area">
		</Alert>
	</div>
</div>




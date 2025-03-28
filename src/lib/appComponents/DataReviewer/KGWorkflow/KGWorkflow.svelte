<script>
	import Datatable from '@components/Datatables/Datatable.svelte';
	import {
		ALLOWED_ATTRIBUTES,
		fetchKGWorkflow,
		FIELD_STATUS,
	} from '@models/kgWorkflow';
	import { TRIALS_ATTRIBUTE } from '@models/trialsWorkflow';
	import { CATEGORY } from '@models/insightsMaster';
	import { SOURCE_TYPE } from '@models/contents';
	import { onMount } from 'svelte';
	import { queryConstructor } from '@utils/utility.js';
	import { Pagination } from '@smui/data-table';
	import { toasts } from '@components/Toast/toasts';
	import EditModal from './EditModal.svelte';
	import { FIRMS_ATTRIBUTE } from '@models/firmsWorkflow';
	import isEmpty from '@utils/is-empty';
	import { createEventDispatcher } from 'svelte';
	import Link from '@appComponents/CellComponents/Link.svelte';

	export let from = '';
	export let insightId;

	const dispatch = createEventDispatcher();
	const DISABLED_STATUS = ['INVALID', 'VERIFIED', 'EXISTS'];
	const DEFAULT_FILTERS = [
		{
			key: 'attribute',
			operator: 'in',
			value: 'ALL',
		},
	];
	let attributeSearchOptions =
		from === 'trials'
			? TRIALS_ATTRIBUTE
			: from === 'firms'
				? FIRMS_ATTRIBUTE
				: ALLOWED_ATTRIBUTES;
	let columnSearchQuery = [...DEFAULT_FILTERS];
	let kgData = [];
	let isDatatableLoading = false;
	let hasNext = false;
	let page = 1;
	let size = 10;
	let searchTerm = '';
	let sortBy = 'id:desc';
	let showEditModal = false;
	let selectedRow;

	$: columns = [
		{
			label: 'ID',
			value: 'id',
			tableName: 'id',
			searchable: true,
			sortable: true,
		},
		{
			label: 'Insight ID',
			value: 'insight_id',
			tableName: 'insight_id',
			searchable: isEmpty(insightId),
			sortable: true,
		},
		{
			label: 'Insight Category',
			value: 'insight_category',
			tableName: 'insight_category',
			searchable: true,
			sortable: true,
			searchType: 'SELECT',
			searchOptions: CATEGORY,
			show: true,
		},
		{
			label: 'Attribute',
			value: 'attribute',
			tableName: 'attribute',
			searchable: true,
			sortable: true,
			searchType: 'SELECT',
			searchOptions: [
				{ label: 'All', value: 'ALL' },
				...attributeSearchOptions,
			],
			clearable: false,
			show: true,
		},
		{
			label: 'Attribute Value',
			value: 'attribute_value',
			tableName: 'attribute_value',
			searchable: true,
			sortable: true,
			show: true,
			transformContent: (record) =>
				`${record.attribute_value}${record.additional_details?.nct_ids ? ' || ' + record.additional_details?.nct_ids : ''}`,
		},
		{
			label: 'Content Source Type',
			value: 'content_source_type',
			tableName: 'content_source_type',
			searchable: true,
			sortable: true,
			searchType: 'SELECT',
			searchOptions: SOURCE_TYPE,
		},
		{
			label: 'Content Source URL',
			value: 'content_source_url',
			tableName: 'content_source_url',
			searchable: true,
			sortable: true,
			show: true,
			cellComponent: Link,
		},
		{
			label: 'Status',
			value: 'status',
			tableName: 'status',
			searchable: true,
			sortable: true,
			searchType: 'SELECT',
			searchOptions: FIELD_STATUS,
			show: true,
		},
		{
			label: 'Actions',
			value: 'ACTION',
			show: true,
			actions: [
				{
					iconName: 'edit',
					handler: (row) => {
						selectedRow = row;
						toggleEditModal();
					},
					disableIf: (row) => {
						let restrictAttribute = from
							? ALLOWED_ATTRIBUTES.map(
									(attr) => attr.value
								).includes(row.attribute)
							: false;
						return (
							DISABLED_STATUS.includes(row.status) ||
							restrictAttribute
						);
					},
				},
			],
		},
	];

	onMount(async () => {
		await fetchKGWorkflowData();
	});

	const toggleEditModal = () => {
		showEditModal = !showEditModal;
	};

	const modifyColumnSearchQuery = (keys) => {
		return columnSearchQuery.map((query) => {
			if (keys.includes(query.key) && query.value === 'ALL') {
				const column = columns.find(
					(column) => column.tableName === query.key
				);
				const options = column.searchOptions.filter(
					(option) => option.value !== 'ALL'
				);
				const value = options.map((option) => option.value).join(':');
				return {
					key: query.key,
					operator: 'in',
					value,
				};
			} else {
				return query;
			}
		});
	};

	const fetchKGWorkflowData = async (searchTerm = '') => {
		try {
			isDatatableLoading = true;
			let modifiedQuery = modifyColumnSearchQuery(['attribute']);
			let queryParam = [...modifiedQuery];
			if (!isEmpty(insightId)) {
				queryParam = [
					{ key: 'insight_id', operator: '==', value: insightId },
					...queryParam,
				];
			}
			[kgData, hasNext] = await fetchKGWorkflow({
				page,
				size,
				search: searchTerm || '',
				query: queryConstructor(queryParam),
				sort_by: sortBy,
			});
		} catch (error) {
			console.warn(error);
			kgData = [];
			hasNext = false;
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			isDatatableLoading = false;
		}

		return kgData;
	};

	const onKGWorkflowFilter = async (e) => {
		page = 1;
		await fetchKGWorkflowData(searchTerm);
	};

	const onSort = (e) => {
		const sortDirection =
			e.detail.sortValue === 'ascending' ? 'asc' : 'desc';
		sortBy = `${e.detail.columnId}:${sortDirection}`;
		page = 1;
		fetchKGWorkflowData(searchTerm);
	};

	const refreshDatatable = async () => {
		await fetchKGWorkflowData(searchTerm);
		dispatch('refreshTable');
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
			sort={getSort()}
			sortDirection={getSortDirection()}
			handleSort={onSort}
			handlefilter={onKGWorkflowFilter}
			toggleColumns={true}
			data={kgData}
			bind:searchTerm
			bind:columnSearchQuery
			bind:rowsPerPage={size}
			bind:currentPage={page}
			onPageChange={() => fetchKGWorkflowData(searchTerm)}
			onGlobalSearch={fetchKGWorkflowData}
			configStorageKey="kg_workflow"
		/>
		<Pagination />
	</div>
</div>

{#if showEditModal}
	<EditModal
		{refreshDatatable}
		{from}
		data={selectedRow}
		onClose={toggleEditModal}
	/>
{/if}

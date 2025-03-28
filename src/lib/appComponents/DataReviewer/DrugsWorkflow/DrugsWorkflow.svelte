<script>
	import Datatable from '@components/Datatables/Datatable.svelte';
	import {
		fetchDrugsWorkflow,
		RELATIONSHIP_STATUS,
		ALLOWED_RELATIONSHIP_TYPES,
		PARENT_ATTRIBUTES,
		CHILD_ATTRIBUTES,
	} from '@models/drugsWorkflow';
	import {
		TRIALS_RELATIONSHIP_TYPE,
		TRIALS_PARENT_ATTRIBUTE,
		TRIALS_CHILD_ATTRIBUTE,
	} from '@models/trialsWorkflow';
	import {
		FIRMS_RELATIONSHIP_TYPE,
		FIRMS_CHILD_ATTRIBUTE,
		FIRMS_PARENT_ATTRIBUTE,
	} from '@models/firmsWorkflow';
	import { CATEGORY } from '@models/insightsMaster';
	import { onMount, onDestroy } from 'svelte';
	import { queryConstructor } from '@utils/utility.js';
	import { Pagination } from '@smui/data-table';
	import { toasts } from '@components/Toast/toasts';
	import EditModal from './EditModal.svelte';
	import isEmpty from '@utils/is-empty';
	import { refreshTable } from '@stores/workflow.store';
	import Link from '@appComponents/CellComponents/Link.svelte';

	export let from = '';
	export let insightId;

	const DISABLED_STATUS = ['INVALID', 'VERIFIED', 'EXISTS'];
	const DEFAULT_FILTERS = [
		{
			key: 'status',
			operator: '==',
			value: 'NEW',
		},
		{
			key: 'relationship_type',
			operator: 'in',
			value: 'ALL',
		},
	];
	let relationshipTypeOptions =
		from === 'trials'
			? TRIALS_RELATIONSHIP_TYPE
			: from === 'firms'
				? FIRMS_RELATIONSHIP_TYPE
				: ALLOWED_RELATIONSHIP_TYPES;
	let parentAttributeOptions =
		from === 'trials'
			? TRIALS_PARENT_ATTRIBUTE
			: from === 'firms'
				? FIRMS_PARENT_ATTRIBUTE
				: PARENT_ATTRIBUTES;
	let childAttributeOptions =
		from === 'trials'
			? TRIALS_CHILD_ATTRIBUTE
			: from === 'firms'
				? FIRMS_CHILD_ATTRIBUTE
				: CHILD_ATTRIBUTES;
	let columnSearchQuery = [...DEFAULT_FILTERS];
	let drugs = [];
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
			show: from !== 'firms',
		},
		{
			label: 'Content Source URL',
			value: 'content_source_url',
			tableName: 'content_source_url',
			searchable: true,
			sortable: true,
			cellComponent: Link,
			show: from !== 'firms',
		},
		{
			label: 'Relationship Type',
			value: 'relationship_type',
			tableName: 'relationship_type',
			searchable: true,
			sortable: true,
			searchType: 'SELECT',
			searchOptions: [
				{ label: 'All', value: 'ALL' },
				...relationshipTypeOptions,
			],
			clearable: false,
			show: from !== 'firms',
		},
		{
			label: 'Parent Attribute',
			value: 'parent_attribute',
			tableName: 'parent_attribute',
			searchable: true,
			sortable: true,
			searchType: 'SELECT',
			searchOptions: parentAttributeOptions,
			show: from !== 'firms',
		},
		{
			label: 'Parent Attribute Value',
			value: 'parent_attribute_value',
			tableName: 'parent_attribute_value',
			searchable: true,
			sortable: true,
			show: from !== 'firms',
		},
		{
			label: 'Parent Insight Attribute ID',
			value: 'parent_insight_attribute_id',
			tableName: 'parent_insight_attribute_id',
			searchable: true,
			sortable: true,
		},
		{
			label: 'Child Attribute',
			value: 'child_attribute',
			tableName: 'child_attribute',
			searchable: true,
			sortable: true,
			searchType: 'SELECT',
			searchOptions: childAttributeOptions,
			show: from !== 'firms',
		},
		{
			label: 'Child Attribute Value',
			value: 'child_attribute_value',
			tableName: 'child_attribute_value',
			searchable: true,
			sortable: true,
			show: from !== 'firms',
		},
		{
			label: 'Child Insight Attribute ID',
			value: 'child_insight_attribute_id',
			tableName: 'child_insight_attribute_id',
			searchable: true,
			sortable: true,
		},
		{
			label: 'Created At',
			value: 'created_at',
			tableName: 'created_at',
			sortable: true,
			searchable: true,
		},
		{
			label: 'Status',
			value: 'status',
			tableName: 'status',
			searchable: true,
			sortable: true,
			searchType: 'SELECT',
			searchOptions: RELATIONSHIP_STATUS,
			show: from !== 'firms',
		},
		{
			label: 'Actions',
			value: 'ACTION',
			show: from !== 'firms',
			actions: [
				{
					iconName: 'edit',
					handler: (row) => {
						selectedRow = row;
						toggleEditModal();
					},
					disableIf: (row) => {
						return DISABLED_STATUS.includes(row.status);
					},
				},
			],
		},
	];

	const unsubscribe = refreshTable.subscribe((value) => {
		if (value) {
			refreshDatatable();
			refreshTable.set(false);
		}
	});

	onDestroy(() => unsubscribe());

	onMount(async () => {
		await fetchDrugsWorkflowData();
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

	const fetchDrugsWorkflowData = async (searchTerm = '') => {
		try {
			isDatatableLoading = true;
			let modifiedQuery = modifyColumnSearchQuery(['relationship_type']);
			let queryParam = [...modifiedQuery];
			if (!isEmpty(insightId)) {
				queryParam = [
					{ key: 'insight_id', operator: '==', value: insightId },
					...queryParam,
				];
			}
			[drugs, hasNext] = await fetchDrugsWorkflow({
				page,
				size,
				search: searchTerm || '',
				query: queryConstructor(queryParam),
				sort_by: sortBy,
			});
		} catch (error) {
			console.warn(error);
			drugs = [];
			hasNext = false;
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			isDatatableLoading = false;
		}

		return drugs;
	};

	const onDrugsWorkflowFilter = async (e) => {
		page = 1;
		await fetchDrugsWorkflowData(searchTerm);
	};

	const onSort = (e) => {
		const sortDirection =
			e.detail.sortValue === 'ascending' ? 'asc' : 'desc';
		sortBy = `${e.detail.columnId}:${sortDirection}`;
		page = 1;
		fetchDrugsWorkflowData(searchTerm);
	};

	const refreshDatatable = async () => {
		await fetchDrugsWorkflowData(searchTerm);
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
			toggleColumns={from !== 'firms'}
			handlefilter={onDrugsWorkflowFilter}
			data={drugs}
			bind:searchTerm
			bind:columnSearchQuery
			bind:rowsPerPage={size}
			bind:currentPage={page}
			onPageChange={() => fetchDrugsWorkflowData(searchTerm)}
			onGlobalSearch={fetchDrugsWorkflowData}
			configStorageKey="drugs_workflow"
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

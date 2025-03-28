<script>
	import Datatable from '@components/Datatables/Datatable.svelte';
	import Button from '@components/Button/Button.svelte';
	import { onMount, createEventDispatcher } from 'svelte';
	import {
		fetchReadoutKeywords,
		deleteReadoutKeyword,
		updateReadoutKeywordsVerificationStatus,
		READOUT_KEYWORDS_LABEL,
	} from '@models/readoutKeywords';
	import { queryConstructor } from '@utils/utility.js';
	import { toasts } from '@components/Toast/toasts';
	import isEmpty from '@utils/is-empty';
	import { Pagination } from '@smui/data-table';
	import AddEditReadoutKeyword from './AddEditReadoutKeyword.svelte';
	import DeleteModal from '@components/Modal/DeleteModal/DeleteModal.svelte';
	import { loader } from '@components/Loader/Loader';
	import { VERIFICATION_STATUS } from '@utils/constants';
	import { transformSnakeToCapitalized } from '@utils/utility';
	import Link from '@appComponents/CellComponents/Link.svelte';
	import SetVerificationStatus from '@appComponents/SetVerificationStatus/SetVerificationStatus.svelte';

	export let readoutId;

	const dispatch = createEventDispatcher();
	let isDatatableLoading = false;
	let hasNext = false;
	let page = 1;
	let size = 10;
	let searchTerm = '';
	let sortBy = 'id:desc';
	let readoutKeywords = [];
	let columnSearchQuery = [];
	let showEditModal = false;
	let showDeleteModal = false;
	let showAddModal = false;
	let showVerificationModal = false;

	let selectedKeyword;

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
			label: 'Readout ID',
			value: 'readout_id',
			tableName: 'readout_id',
			searchable: true,
			sortable: true,
			width: 175,
		},
		{
			label: 'Label',
			value: 'label',
			tableName: 'label',
			searchable: true,
			sortable: true,
			searchType: 'SELECT',
			searchOptions: Object.values(READOUT_KEYWORDS_LABEL).map(
				(lvalue) => {
					return {
						label: lvalue,
						value: lvalue,
					};
				}
			),
		},
		{
			label: 'Value',
			value: 'value',
			tableName: 'value',
			searchable: true,
			sortable: true,
		},
		{
			label: 'Value Root ID',
			value: 'value_root_id',
			tableName: 'value_root_id',
			searchable: true,
			sortable: true,
			width: 175,
			cellComponent: Link,
			cellComponentProps: (row) => ({
				data: row.value_root_id,
				href: `#/roots/${row.value_root_id}`,
			}),
		},
		{
			label: 'Comment',
			value: 'comment',
			tableName: 'comment',
			searchable: true,
			sortable: true,
		},
		{
			label: 'Verification Status',
			value: 'verification_status',
			tableName: 'verification_status',
			searchable: true,
			sortable: true,
			searchType: 'SELECT',
			searchOptions: Object.values(VERIFICATION_STATUS).map( status => { 
				return {
					label: transformSnakeToCapitalized(status),
					value: status,
				}
			})
		},
		{
			label: 'Actions',
			value: 'ACTION',
			actions: [
				{
					iconName: 'edit',
					handler: (keyword) => {
						selectedKeyword = keyword;
						toggleEditModal();
					},
				},
				{
					iconName: 'delete',
					handler: (keyword) => {
						selectedKeyword = keyword;
						toggleDeleteModal();
					},
				},
			],
		},
	];

	onMount(async () => {
		await fetchReadoutKeywordsData();
	});

	const fetchReadoutKeywordsData = async (searchTerm = '') => {
		try {
			let meta = {};
			isDatatableLoading = true;
			let queryParam = [
				{
					key: 'readout_id',
					operator: '==',
					value: readoutId,
				},
				...columnSearchQuery,
			];
			[readoutKeywords, hasNext, meta] = await fetchReadoutKeywords({
				page,
				size,
				search: searchTerm || '',
				query: queryConstructor(queryParam),
				sort_by: sortBy,
				overall_verification_status: true,
			});
			dispatch('EscalateOverallStatus', {
				Keywords: meta.escalated || false,
			});
		} catch (error) {
			console.warn(error);
			readoutKeywords = [];
			hasNext = false;
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			isDatatableLoading = false;
		}
		return readoutKeywords;
	};

	const onDeleteKeyword = async () => {
		try {
			loader.show();
			await deleteReadoutKeyword(selectedKeyword.id);
			await refreshDatatable();
			toasts.success('Keyword deleted successfully.');
			toggleDeleteModal();
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	};

	const onFilter = async (e) => {
		page = 1;
		await fetchReadoutKeywordsData(searchTerm);
	};

	const onSort = (e) => {
		const sortDirection =
			e.detail.sortValue === 'ascending' ? 'asc' : 'desc';
		sortBy = `${e.detail.columnId}:${sortDirection}`;
		page = 1;
		fetchReadoutKeywordsData(searchTerm);
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

	const toggleEditModal = () => {
		showEditModal = !showEditModal;
	};

	const toggleAddModal = () => {
		showAddModal = !showAddModal;
	};

	const refreshDatatable = async () => {
		await fetchReadoutKeywordsData(searchTerm);
		dispatch('RefreshAuditLog');
	};

	const toggleDeleteModal = () => {
		showDeleteModal = !showDeleteModal;
	};

	const toggleVerificationModal = () => {
		showVerificationModal = !showVerificationModal;
	};

	const updateVerificationStatus = async (verificationStatus) => {
		try {
			loader.show();

			await updateReadoutKeywordsVerificationStatus(readoutId, {
				verification_status: verificationStatus,
			});
			await refreshDatatable();
			toasts.success(
				'Verification status for all Readouts Keywords updated successfully.'
			);
			toggleVerificationModal();
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	};
</script>

<div class="readout-keywords__datatable datatable">
	<div class="datatable__content">
		<Datatable
			{columns}
			{hasNext}
			loading={isDatatableLoading}
			sort={getSort()}
			sortDirection={getSortDirection()}
			handleSort={onSort}
			handlefilter={onFilter}
			data={readoutKeywords}
			disableGlobalSearch={true}
			bind:searchTerm
			bind:columnSearchQuery
			bind:rowsPerPage={size}
			bind:currentPage={page}
			onPageChange={() => fetchReadoutKeywordsData(searchTerm)}
		>
			<svelte:fragment slot="header-button">
				{#if !isEmpty(readoutKeywords)}
					<Button type="secondary" onClick={toggleVerificationModal}
					>Set Verification Status</Button
					>
				{/if}
				<div style="margin-left: auto;">
					<Button type="secondary" onClick={toggleAddModal}
						>Add</Button
					>
				</div>
			</svelte:fragment>
		</Datatable>
		<Pagination />
	</div>
</div>
{#if showVerificationModal}
	<SetVerificationStatus
		onClose={toggleVerificationModal}
		onUpdateStatus={updateVerificationStatus}
	>
		<span slot="message">
			Are you sure you want to change verification for <strong>all readouts keywords </strong> in current readout ID - {readoutId} ?
		</span>
	</SetVerificationStatus>
{/if}
{#if showEditModal}
	<AddEditReadoutKeyword
		{readoutId}
		{refreshDatatable}
		readoutKeyword={selectedKeyword}
		onClose={toggleEditModal}
	/>
{/if}
{#if showAddModal}
	<AddEditReadoutKeyword
		{readoutId}
		{refreshDatatable}
		readoutKeyword={null}
		onClose={toggleAddModal}
	/>
{/if}
{#if showDeleteModal}
	<DeleteModal
		entityName="readout keyword"
		onClose={toggleDeleteModal}
		on:delete={onDeleteKeyword}
	/>
{/if}

<script>
	import Datatable from '@components/Datatables/Datatable.svelte';
	import Button from '@components/Button/Button.svelte';
	import { onMount, createEventDispatcher } from 'svelte';
	import {
		fetchReadoutStudies,
		deleteReadoutStudies,
		updateReadoutStudiesVerificationStatus,
	} from '@models/readoutStudies';
	import { queryConstructor } from '@utils/utility.js';
	import { toasts } from '@components/Toast/toasts';
	import isEmpty from '@utils/is-empty';
	import { Pagination } from '@smui/data-table';
	import AddEditReadoutStudy from './AddEditReadoutStudy.svelte';
	import DeleteModal from '@components/Modal/DeleteModal/DeleteModal.svelte';
	import { loader } from '@components/Loader/Loader';
	import { VERIFICATION_STATUS } from '@utils/constants';
	import { transformSnakeToCapitalized } from '@utils/utility';
	import Link from '@appComponents/CellComponents/Link.svelte';
	import SetVerificationStatus from '@appComponents/SetVerificationStatus/SetVerificationStatus.svelte';

	export let readoutId = null;
	export let trial = null;

	const dispatch = createEventDispatcher();
	let isDatatableLoading = false;
	let hasNext = false;
	let page = 1;
	let size = 10;
	let searchTerm = '';
	let sortBy = 'id:desc';
	let readoutStudies = [];
	let columnSearchQuery = [];
	let showEditModal = false;
	let showDeleteModal = false;
	let showAddModal = false;
	let showVerificationModal = false;

	let selectedStudy;

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
			cellComponent: Link,
			cellComponentProps: (row) => ({
				data: row.readout_id,
				href: `#/readouts/${row.readout_id}`,
			}),
		},
		{
			label: 'Study ID',
			value: 'study_id',
			tableName: 'study_id',
			searchable: true,
			sortable: true,
			width: 175,
		},
		{
			label: 'NCT ID',
			value: 'nct_id',
			tableName: 'trials_nct_id',
			searchable: true,
			sortable: true,
		},
		{
			label: 'Trial Acronym',
			value: 'acronym',
			tableName: 'trials_acronym',
			searchable: true,
			sortable: true,
			cellComponent: Link,
			cellComponentProps: (row) => ({
				data: row.acronym,
				href: `#/roots/${row.acronym_root_id}`,
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
				...(trial ? [{
					iconName: 'visibility',
					handler: (trial) => {
						window.open(`#/readouts/${trial.readout_id}`, '_blank');
					},
				}] : []),
				...(!trial ? [
					{
						iconName: 'edit',
						handler: (study) => {
							selectedStudy = study;
							toggleEditModal();
						},
					},
					{
						iconName: 'delete',
						handler: (study) => {
							selectedStudy = study;
							toggleDeleteModal();
						},
					}
				] : []),
			],
		},
	];

	onMount(async () => {
		await fetchReadoutStudiesData();
		if (!readoutId) {
			readoutId = trial.readout_id;
		}
	});

	const fetchReadoutStudiesData = async (searchTerm = '') => {
		try {
			let meta = {};
			isDatatableLoading = true;
			let searchConfig = {};
			if (!trial) {
				searchConfig = {
					key: 'readout_id',
					operator: '==',
					value: readoutId,
				}
			} else {
				searchConfig = {
					key: 'study_id',
					operator: '==',
					value: trial.study_id,
				}
			}
			let queryParam = [searchConfig, ...columnSearchQuery];
			[readoutStudies, hasNext, meta] = await fetchReadoutStudies({
				page,
				size,
				search: searchTerm || '',
				query: queryConstructor(queryParam),
				sort_by: sortBy,
				overall_verification_status: true,
			});
			if (!trial) {
				dispatch('EscalateOverallStatus', {
					sudies: meta.escalated || false,
				});
			} else {
				dispatch('EscalateOverallStatus', {
					readout_studies: meta.escalated || false,
				});
			}
		} catch (error) {
			console.warn(error);
			readoutStudies = [];
			hasNext = false;
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			isDatatableLoading = false;
		}
		return readoutStudies;
	};

	const onDeleteKeyword = async () => {
		try {
			loader.show();
			await deleteReadoutStudies(selectedStudy.id);
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
		await fetchReadoutStudiesData(searchTerm);
	};

	const onSort = (e) => {
		const sortDirection =
			e.detail.sortValue === 'ascending' ? 'asc' : 'desc';
		sortBy = `${e.detail.columnId}:${sortDirection}`;
		page = 1;
		fetchReadoutStudiesData(searchTerm);
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
		await fetchReadoutStudiesData(searchTerm);
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

			await updateReadoutStudiesVerificationStatus(readoutId, {
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
			data={readoutStudies}
			disableGlobalSearch={true}
			bind:searchTerm
			bind:columnSearchQuery
			bind:rowsPerPage={size}
			bind:currentPage={page}
			onPageChange={() => fetchReadoutStudiesData(searchTerm)}
		>
				<svelte:fragment slot="header-button">
					{#if !trial}
						{#if !isEmpty(readoutStudies)}
							<Button type="secondary" onClick={toggleVerificationModal}
							>Set Verification Status</Button
							>
						{/if}
						<div style="margin-left: auto;">
							<Button type="secondary" onClick={toggleAddModal}>Add</Button>
						</div>
					{/if}
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
			Are you sure you want to change verification for <strong>all readouts studies </strong> in current readout ID - {readoutId} ?
		</span>
	</SetVerificationStatus>
{/if}
{#if showEditModal}
	<AddEditReadoutStudy
		{readoutId}
		{refreshDatatable}
		readoutStudy={selectedStudy}
		onClose={toggleEditModal}
	/>
{/if}
{#if showAddModal}
	<AddEditReadoutStudy
		{readoutId}
		{refreshDatatable}
		readoutStudy={null}
		onClose={toggleAddModal}
	/>
{/if}
{#if showDeleteModal}
	<DeleteModal
		entityName="readout study"
		onClose={toggleDeleteModal}
		on:delete={onDeleteKeyword}
	/>
{/if}

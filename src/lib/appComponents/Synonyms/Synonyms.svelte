<script>
	import Button from '@components/Button/Button.svelte';
	import Datatable from '@components/Datatables/Datatable.svelte';
	import {
		deleteSynonyms,
		fetchSynonymsDataTable,
		invalidateSynonyms,
		updateSynonymVerificationStatus,
	} from '@models/synonyms';
	import { queryConstructor } from '@utils/utility';
	import { onMount, createEventDispatcher } from 'svelte';
	import EditSynonym from './EditSynonym.svelte';
	import AddSynonym from './AddSynonym.svelte';
	import DeleteModal from '@components/Modal/DeleteModal/DeleteModal.svelte';
	import { toasts } from '@components/Toast/toasts';
	import { loader } from '@components/Loader/Loader';
	import { VERIFICATION_STATUS } from '@utils/constants.js';
	import InvalidateSynonym from './InvalidateSynonym.svelte';
	import SetVerificationStatus from '@appComponents/SetVerificationStatus/SetVerificationStatus.svelte';
	import isEmpty from '@utils/is-empty.js';
	import { transformSnakeToCapitalized } from '@utils/utility';

	export let root;
	export let rootId;

	const dispatch = createEventDispatcher();

	let page = 1;
	let size = 10;
	let synonyms = [];
	let hasNext = false;
	let showVerificationModal = false;
	let showAddSynonymModal = false;
	let showEditSynonymModal = false;
	let showDeleteSynonymModal = false;
	let showInvalidateSynonymModal = false;
	let searchTerm = '';
	let selectedSynonym;
	let isDatatableLoading = false;
	let sort_by = '';
	let columnSearchQuery = [];

	const toggleVerificationModal = () => {
		showVerificationModal = !showVerificationModal;
	};
	const toggleAddModal = () => {
		showAddSynonymModal = !showAddSynonymModal;
	};
	const toggleEditModal = () => {
		showEditSynonymModal = !showEditSynonymModal;
	};
	const toggleDeleteModal = () => {
		showDeleteSynonymModal = !showDeleteSynonymModal;
	};
	const toggleInvalidateModal = () => {
		showInvalidateSynonymModal = !showInvalidateSynonymModal;
	};

	$: columns = [
		{
			label: 'Id',
			value: 'id',
			tableName: 'id',
			sortable: true,
			searchable: true,
		},
		{
			label: 'Synonym',
			value: 'name',
			tableName: 'name',
			searchable: true,
			sortable: true,
		},
		{
			label: 'Generated',
			value: 'is_generated',
			tableName: 'is_generated',
			searchable: true,
			sortable: true,
			searchType: 'SELECT',
			searchOptions: [
				{ label: 'True', value: 1 },
				{ label: 'False', value: 0 },
			],
		},
		{
			label: 'Parent Synonym',
			value: 'parent_synonym_name',
			tableName: 'parent_synonym_name',
			searchable: true,
			sortable: true,
		},
		{
			label: 'Case Sensitive',
			value: 'is_case_sensitive',
			tableName: 'is_case_sensitive',
			searchable: true,
			sortable: true,
			searchType: 'SELECT',
			searchOptions: [
				{ label: 'True', value: 1 },
				{ label: 'False', value: 0 },
			],
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
			transformContent: (record) =>
				`${transformSnakeToCapitalized(record.verification_status)}`,
			sortable: true,
			searchable: true,
			searchType: 'SELECT',
			searchOptions: Object.values(VERIFICATION_STATUS).map((status) => {
				return {
					label: transformSnakeToCapitalized(status),
					value: status,
				};
			}),
		},
		{
			label: 'Actions',
			value: 'ACTION',
			actions: [
				{
					iconName: 'edit',
					handler: (synonym) => {
						selectedSynonym = synonym;
						toggleEditModal();
					},
					disableIf: (row) => {
						return row.is_generated;
					}
				},
				{
					iconName: 'delete',
					handler: (synonym) => {
						selectedSynonym = synonym;
						toggleDeleteModal();
					},
				},
				{
					iconName: 'block',
					title: 'invalid',
					handler: (synonym) => {
						selectedSynonym = synonym;
						toggleInvalidateModal();
					},
				},
			],
		},
	];

	onMount(async () => {
		await fetchSynonymsByRootId();
	});
	const fetchSynonymsByRootId = async (searchTerm = '') => {
		try {
			let meta = {};
			let queryParam = [
				{
					key: 'root_id',
					operator: '==',
					value: rootId,
				},
				...columnSearchQuery,
			];
			isDatatableLoading = true;
			[synonyms, hasNext, meta] = await fetchSynonymsDataTable({
				page,
				size,
				search: searchTerm || '',
				query: queryConstructor(queryParam),
				sort_by,
				overall_verification_status: true,
			});
			dispatch('EscalateOverallStatus', {
				synonyms: meta.escalated || false,
			});
		} catch (error) {
			console.warn(error);
			synonyms = [];
			hasNext = false;
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			isDatatableLoading = false;
		}
		return synonyms;
	};
	const refreshDatatable = async () => {
		await fetchSynonymsByRootId(searchTerm);
		dispatch('RefreshAuditLog');
	};
	const onDeleteSynonym = async () => {
		try {
			loader.show();
			await deleteSynonyms(selectedSynonym.id);
			await refreshDatatable();
			toasts.success('Synonym(s) deleted successfully.');
			toggleDeleteModal();
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	};
	const onInvalidateSynonym = async () => {
		try {
			loader.show();
			await invalidateSynonyms(selectedSynonym.id);
			await refreshDatatable();
			toasts.success('Synonym(s) invalidated successfully.');
			toggleInvalidateModal();
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	};
	const updateVerificationStatus = async (verificationStatus) => {
		try {
			loader.show();

			await updateSynonymVerificationStatus(root.id, {
				verification_status: verificationStatus,
			});
			await refreshDatatable();
			toasts.success(
				'Verification status for all Synonyms updated successfully.'
			);
			toggleVerificationModal();
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	};
	const onSynonymSort = async (e) => {
		const sortDirection =
			e.detail.sortValue === 'ascending' ? 'asc' : 'desc';
		sort_by = `${columns[e.detail.columnIndex].tableName}:${sortDirection}`;
		page = 1;
		await fetchSynonymsByRootId(searchTerm);
	};
	const onSynonymfilter = async (e) => {
		page = 1;
		await fetchSynonymsByRootId(searchTerm);
	};
</script>

<section class="synonym">
	<div class="synonym__header">
		{root.label} Synonyms
	</div>
	<div class="synonym__datatable">
		<Datatable
			{columns}
			{hasNext}
			data={synonyms}
			loading={isDatatableLoading}
			handleSort={onSynonymSort}
			handlefilter={onSynonymfilter}
			bind:searchTerm
			bind:columnSearchQuery
			bind:rowsPerPage={size}
			bind:currentPage={page}
			onPageChange={() => fetchSynonymsByRootId(searchTerm)}
			onGlobalSearch={fetchSynonymsByRootId}
		>
			<svelte:fragment slot="header-button">
				{#if !isEmpty(synonyms)}
					<Button type="secondary" onClick={toggleVerificationModal}
						>Set Verification Status</Button
					>
				{/if}
				<Button type="secondary" onClick={toggleAddModal}>Add</Button>
			</svelte:fragment>
		</Datatable>
	</div>
</section>
{#if showVerificationModal}
	<SetVerificationStatus
		onClose={toggleVerificationModal}
		onUpdateStatus={updateVerificationStatus}
	>
		<span slot="message">
			Are you sure you want to change verification for <strong>all synonyms</strong> of root - {root.name} ?
		</span>
	</SetVerificationStatus>
{/if}
{#if showAddSynonymModal}
	<AddSynonym {root} {refreshDatatable} onClose={toggleAddModal} />
{/if}
{#if showEditSynonymModal}
	<EditSynonym
		{root}
		{refreshDatatable}
		synonym={selectedSynonym}
		onClose={toggleEditModal}
	/>
{/if}
{#if showDeleteSynonymModal}
	<DeleteModal
		entityName="synonym"
		onClose={toggleDeleteModal}
		alertMessage="When a parent synonym is deleted, its corresponding child (auto-generated) synonyms will also be deleted."
		on:delete={onDeleteSynonym}
	/>
{/if}
{#if showInvalidateSynonymModal}
	<InvalidateSynonym
		synonym={selectedSynonym}
		onClose={toggleInvalidateModal}
		alertMessage="When a parent synonym is invalidated, its corresponding child (auto-generated) synonyms will also be invalidated."
		on:invalidate={onInvalidateSynonym}
	/>
{/if}

<style src="./style.scss"></style>

<script>
	import Button from '@components/Button/Button.svelte';
	import Datatable from '@components/Datatables/Datatable.svelte';
	import Input from '@components/Input/Input.svelte';
	import { debounce, queryConstructor } from '@utils/utility';
	import { onMount, createEventDispatcher } from 'svelte';
	import DeleteModal from '@components/Modal/DeleteModal/DeleteModal.svelte';
	import AddEditDrugStudies from './AddEditDrugStudies.svelte';
	import { deleteDrugStudy, fetchDrugStudies } from '@models/drugStudies';
	import { toasts } from '@components/Toast/toasts';
	import { loader } from '@components/Loader/Loader';
	import { DRUG_TYPE, VERIFICATION_STATUS } from '@utils/constants';
	import { transformSnakeToCapitalized } from '@utils/utility';
	import Link from '@appComponents/CellComponents/Link.svelte';

	export let trial;

	const dispatch = createEventDispatcher();

	let page = 1;
	let size = 10;
	let drugStudies = [];
	let hasNext = false;
	let showAddModal = false;
	let showEditModal = false;
	let showDeleteModal = false;
	let searchTerm = '';
	let selectedDrugStudy;
	let showViewModal = false;
	let isDatatableLoading = false;
	let sortBy = '';
	let columnSearchQuery = [];
	const toggleAddModal = () => {
		showAddModal = !showAddModal;
	};
	const toggleEditModal = () => {
		showEditModal = !showEditModal;
	};
	const toggleDeleteModal = () => {
		showDeleteModal = !showDeleteModal;
	};
	let columns = [
		{
			label: 'Id',
			value: 'id',
			tableName: 'id',
			sortable: true,
			searchable: true,
		},
		{
			label: 'Study Id',
			value: 'study_id',
			tableName: 'study_id',
			sortable: true,
			searchable: true,
		},
		{
			label: 'Drug',
			value: 'drug_name',
			tableName: 'drug_name',
			sortable: true,
			searchable: true,
			cellComponent: Link,
			cellComponentProps: (row) => ({
				data: row.drug_name,
				href: `#/roots/${row.drug_root_id}`,
			}),
		},
		{
			label: 'Drug Type',
			value: 'drug_type',
			tableName: 'drug_type',
			sortable: true,
			searchable: true,
			searchType: 'SELECT',
			searchOptions: Object.values(DRUG_TYPE).map( status => {
				return {
					label: status,
					value: status,
				}
			})
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
			sortable: true,
			searchable: true,
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
					handler: (drugStudy) => {
						selectedDrugStudy = drugStudy;
						toggleEditModal();
					},
				},
				{
					iconName: 'delete',
					handler: (drugStudy) => {
						selectedDrugStudy = drugStudy;
						toggleDeleteModal();
					},
				},
			],
		},
	];

	onMount(async () => {
		await fetchDrugStudiesByTrialId();
	});
	const fetchDrugStudiesByTrialId = async (searchTerm = '') => {
		try {
			let meta = {};
			let queryParam = [
				{
					key: 'study_id',
					operator: '==',
					value: trial.study_id,
				},
				...columnSearchQuery,
			];
			isDatatableLoading = true;
			[drugStudies, hasNext, meta] = await fetchDrugStudies({
				page,
				size,
				search: searchTerm || '',
				query: queryConstructor(queryParam),
				sort_by: sortBy,
				overall_verification_status: true,
			});
			dispatch('EscalateOverallStatus', {
				drugs_studies: meta.escalated || false,
			});
		} catch (error) {
			console.warn(error);
			drugStudies = [];
			hasNext = false;
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			isDatatableLoading = false;
		}
		return drugStudies;
	};
	const onDeleteDrugStudy = async () => {
		try {
			loader.show();
			await deleteDrugStudy(selectedDrugStudy.id);
			await refreshDatatable();
			toasts.success('Drug study deleted successfully.');
			toggleDeleteModal();
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	};
	const refreshDatatable = async () => {
		await fetchDrugStudiesByTrialId(searchTerm);
		dispatch('RefreshAuditLog');
	};
	const onDrugStudiesSort = async (e) => {
		const sortDirection =
			e.detail.sortValue === 'ascending' ? 'asc' : 'desc';
		sortBy = `${e.detail.columnId}:${sortDirection}`;
		page = 1;
		await fetchDrugStudiesByTrialId(searchTerm);
	};
	const onDrugStudiesfilter = async (e) => {
		page = 1;
		await fetchDrugStudiesByTrialId(searchTerm);
	};
</script>

<section class="drug-study">
	<div class="drug-study__header">Drug Studies</div>
	<div class="drug-study__datatable datatable">
		<Datatable
			{columns}
			{hasNext}
			loading={isDatatableLoading}
			data={drugStudies}
			handleSort={onDrugStudiesSort}
			handlefilter={onDrugStudiesfilter}
			bind:searchTerm
			bind:columnSearchQuery
			bind:rowsPerPage={size}
			bind:currentPage={page}
			onPageChange={() => fetchDrugStudiesByTrialId(searchTerm)}
			onGlobalSearch={fetchDrugStudiesByTrialId}
		>
			<svelte:fragment slot="header-button">
				<Button type="secondary" onClick={toggleAddModal}>Add</Button>
			</svelte:fragment>
		</Datatable>
	</div>
</section>
{#if showAddModal}
	<AddEditDrugStudies
		{trial}
		drugStudy={null}
		{refreshDatatable}
		onClose={toggleAddModal}
	/>
{/if}
{#if showEditModal}
	<AddEditDrugStudies
		{trial}
		{refreshDatatable}
		drugStudy={selectedDrugStudy}
		onClose={toggleEditModal}
	/>
{/if}
{#if showDeleteModal}
	<DeleteModal
		entityName="drug study"
		onClose={toggleDeleteModal}
		on:delete={onDeleteDrugStudy}
	/>
{/if}

<style src="./style.scss"></style>

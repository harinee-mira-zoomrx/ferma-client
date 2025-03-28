<script>
	import Button from '@components/Button/Button.svelte';
	import Datatable from '@components/Datatables/Datatable.svelte';
	import Link from '@appComponents/CellComponents/Link.svelte';

	import Input from '@components/Input/Input.svelte';
	import { debounce, queryConstructor } from '@utils/utility';
	import { onMount, createEventDispatcher } from 'svelte';
	import DeleteModal from '@components/Modal/DeleteModal/DeleteModal.svelte';
	import AddEditDiseaseStudies from './AddEditDiseaseStudies.svelte';
	import {
		deleteDiseaseStudy,
		fetchDiseaseStudies,
	} from '@models/diseaseStudies';
	import { toasts } from '@components/Toast/toasts';
	import { loader } from '@components/Loader/Loader';
	import { VERIFICATION_STATUS } from '@utils/constants';
	import { transformSnakeToCapitalized } from '@utils/utility';

	const dispatch = createEventDispatcher();

	export let trial;
	let page = 1;
	let size = 10;
	let diseaseStudies = [];
	let hasNext = false;
	let showAddModal = false;
	let showEditModal = false;
	let showDeleteModal = false;
	let searchTerm = '';
	let selectedDiseaseStudy;
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
	const toggleViewModal = () => {
		showViewModal = !showViewModal;
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
			label: 'Disease',
			value: 'disease_name',
			tableName: 'disease_name',
			sortable: true,
			searchable: true,
			cellComponent: Link,
			cellComponentProps: (row) => ({
				data: row.disease_name,
				href: `#/roots/${row.disease_root_id}`,
			}),
		},
		{
			label: 'Indication',
			value: 'indication',
			tableName: 'indication',
			sortable: true,
			searchable: true,
		},
		{
			label: 'Therapy Area',
			value: 'therapy_areas',
			tableName: 'therapy_areas',
			sortable: true,
			searchable: true,
		},
		{
			label: 'Approval Date',
			value: 'date',
			tableName: 'date',
			sortable: true,
			searchable: true,
		},
		{
			label: 'Review Designations',
			value: 'review_designations',
			tableName: 'review_designations',
			sortable: true,
			searchable: true,
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
					handler: (diseaseStudy) => {
						selectedDiseaseStudy = diseaseStudy;
						toggleEditModal();
					},
				},
				{
					iconName: 'delete',
					handler: (diseaseStudy) => {
						selectedDiseaseStudy = diseaseStudy;
						toggleDeleteModal();
					},
				},
			],
		},
	];

	onMount(async () => {
		await fetchDiseaseStudiesByTrialId();
	});
	const fetchDiseaseStudiesByTrialId = async (searchTerm = '') => {
		try {
			let meta = {};
			isDatatableLoading = true;
			let queryParam = [
				{
					key: 'study_id',
					operator: '==',
					value: trial.study_id,
				},
				...columnSearchQuery,
			];
			[diseaseStudies, hasNext, meta] = await fetchDiseaseStudies({
				page,
				size,
				search: searchTerm || '',
				query: queryConstructor(queryParam),
				sort_by: sortBy,
				overall_verification_status: true,
			});
			dispatch('EscalateOverallStatus', {
				diseases_studies: meta.escalated || false,
			});
		} catch (error) {
			console.warn(error);
			diseaseStudies = [];
			hasNext = false;
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			isDatatableLoading = false;
		}
		return diseaseStudies;
	};
	const onDeleteDiseaseStudy = async () => {
		try {
			loader.show();
			await deleteDiseaseStudy(selectedDiseaseStudy.id);
			await refreshDatatable();
			toasts.success('Disease study deleted successfully.');
			toggleDeleteModal();
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	};
	const refreshDatatable = async () => {
		await fetchDiseaseStudiesByTrialId(searchTerm);
		dispatch('RefreshAuditLog');
	};
	const onDiseaseStudiesSort = async (e) => {
		const sortDirection =
			e.detail.sortValue === 'ascending' ? 'asc' : 'desc';
		sortBy = `${e.detail.columnId}:${sortDirection}`;
		page = 1;
		await fetchDiseaseStudiesByTrialId(searchTerm);
	};
	const onDiseaseStudiesfilter = async (e) => {
		page = 1;
		await fetchDiseaseStudiesByTrialId(searchTerm);
	};
</script>

<section class="disease-study">
	<div class="disease-study__header">Disease Studies</div>
	<div class="disease-study__datatable datatable">
		<Datatable
			{columns}
			{hasNext}
			loading={isDatatableLoading}
			data={diseaseStudies}
			handleSort={onDiseaseStudiesSort}
			handlefilter={onDiseaseStudiesfilter}
			bind:searchTerm
			bind:columnSearchQuery
			bind:rowsPerPage={size}
			bind:currentPage={page}
			onPageChange={() => fetchDiseaseStudiesByTrialId(searchTerm)}
			onGlobalSearch={fetchDiseaseStudiesByTrialId}
		>
			<svelte:fragment slot="header-button">
				<Button type="secondary" onClick={toggleAddModal}>Add</Button>
			</svelte:fragment>
		</Datatable>
	</div>
</section>
{#if showAddModal}
	<AddEditDiseaseStudies
		{refreshDatatable}
		{trial}
		diseaseStudy={null}
		onClose={toggleAddModal}
	/>
{/if}
{#if showEditModal}
	<AddEditDiseaseStudies
		{refreshDatatable}
		diseaseStudy={selectedDiseaseStudy}
		onClose={toggleEditModal}
	/>
{/if}
{#if showViewModal}
	<AddEditDiseaseStudies
		{refreshDatatable}
		diseaseStudy={selectedDiseaseStudy}
		onClose={toggleViewModal}
		isViewOnly={true}
	>
		<svelte:fragment>
			<Button
				type="secondary"
				onClick={() => {
					toggleViewModal();
					toggleEditModal();
				}}
			>
				Edit
			</Button>
			<Button
				type="secondary"
				onClick={() => {
					toggleViewModal();
					toggleDeleteModal();
				}}
			>
				Delete
			</Button>
		</svelte:fragment>
	</AddEditDiseaseStudies>
{/if}
{#if showDeleteModal}
	<DeleteModal
		entityName="disease study"
		onClose={toggleDeleteModal}
		on:delete={onDeleteDiseaseStudy}
	/>
{/if}

<style src="./style.scss"></style>

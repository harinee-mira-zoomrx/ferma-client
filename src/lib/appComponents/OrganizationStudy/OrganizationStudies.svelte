<script>
	import Button from '@components/Button/Button.svelte';
	import Datatable from '@components/Datatables/Datatable.svelte';
	import Input from '@components/Input/Input.svelte';
	import { debounce, queryConstructor } from '@utils/utility';
	import { onMount, createEventDispatcher } from 'svelte';
	import DeleteModal from '@components/Modal/DeleteModal/DeleteModal.svelte';
	import AddEditOrganizationStudies from './AddEditOrganizationStudies.svelte';
	import {
		deleteOrganizationStudy,
		fetchOrganizationStudies, ORGANIZATION_ROLE,
	} from '@models/organizationStudies';
	import { toasts } from '@components/Toast/toasts';
	import { loader } from '@components/Loader/Loader';
	import { VERIFICATION_STATUS } from '@utils/constants';
	import { transformSnakeToCapitalized } from '@utils/utility';
	import Link from '@appComponents/CellComponents/Link.svelte';
	import { ORGANIZATION_STAGE } from '@models/organization.js';

	const dispatch = createEventDispatcher();

	export let trial;
	let page = 1;
	let size = 10;
	let organizationStudies = [];
	let hasNext = false;
	let showAddModal = false;
	let showEditModal = false;
	let showDeleteModal = false;
	let searchTerm = '';
	let selectedOrganizationStudy;
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
			label: 'Organization',
			value: 'organization_name',
			tableName: 'organization_name',
			sortable: true,
			searchable: true,
			cellComponent: Link,
			cellComponentProps: (row) => ({
				data: row.organization_name,
				href: `#/roots/${row.organization_root_id}`,
			}),
		},
		{
			label: 'Organization Role',
			value: 'organization_role',
			tableName: 'organization_role',
			sortable: true,
			searchable: true,
			searchType: 'SELECT',
			searchOptions: Object.values(ORGANIZATION_ROLE).map(key => {
				return {
					label: key,
					value: key,
				}
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
					handler: (organizationStudy) => {
						selectedOrganizationStudy = organizationStudy;
						toggleEditModal();
					},
				},
				{
					iconName: 'delete',
					handler: (organizationStudy) => {
						selectedOrganizationStudy = organizationStudy;
						toggleDeleteModal();
					},
				},
			],
		},
	];

	onMount(async () => {
		await fetchOrganizationStudiesByTrialId();
	});
	const fetchOrganizationStudiesByTrialId = async (searchTerm = '') => {
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
			[organizationStudies, hasNext, meta] = await fetchOrganizationStudies({
				page,
				size,
				search: searchTerm || '',
				query: queryConstructor(queryParam),
				sort_by: sortBy,
				overall_verification_status: true,
			});
			dispatch('EscalateOverallStatus', {
				organizations_studies: meta.escalated || false,
			});
		} catch (error) {
			console.warn(error);
			organizationStudies = [];
			hasNext = false;
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			isDatatableLoading = false;
		}
		return organizationStudies;
	};
	const onOrganizationStudy = async () => {
		try {
			loader.show();
			await deleteOrganizationStudy(selectedOrganizationStudy.id);
			await refreshDatatable();
			toasts.success('Organization study deleted successfully.');
			toggleDeleteModal();
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	};
	const refreshDatatable = async () => {
		await fetchOrganizationStudiesByTrialId(searchTerm);
		dispatch('RefreshAuditLog');
	};
	const onOrganizationStudiesSort = async (e) => {
		const sortDirection =
			e.detail.sortValue === 'ascending' ? 'asc' : 'desc';
		sortBy = `${e.detail.columnId}:${sortDirection}`;
		page = 1;
		await fetchOrganizationStudiesByTrialId(searchTerm);
	};
	const onOrganizationStudiesfilter = async (e) => {
		page = 1;
		await fetchOrganizationStudiesByTrialId(searchTerm);
	};
</script>

<section class="organization-study">
	<div class="organization-study__header">Organization Studies</div>
	<div class="organization-study__datatable datatable">
		<Datatable
			{columns}
			{hasNext}
			loading={isDatatableLoading}
			data={organizationStudies}
			handleSort={onOrganizationStudiesSort}
			handlefilter={onOrganizationStudiesfilter}
			bind:searchTerm
			bind:columnSearchQuery
			bind:rowsPerPage={size}
			bind:currentPage={page}
			onPageChange={() => fetchOrganizationStudiesByTrialId(searchTerm)}
			onGlobalSearch={fetchOrganizationStudiesByTrialId}
		>
			<svelte:fragment slot="header-button">
				<Button type="secondary" onClick={toggleAddModal}>Add</Button>
			</svelte:fragment>
		</Datatable>
	</div>
</section>
{#if showAddModal}
	<AddEditOrganizationStudies
		{refreshDatatable}
		{trial}
		organizationStudy={null}
		onClose={toggleAddModal}
	/>
{/if}
{#if showEditModal}
	<AddEditOrganizationStudies
		{refreshDatatable}
		organizationStudy={selectedOrganizationStudy}
		onClose={toggleEditModal}
	/>
{/if}
{#if showDeleteModal}
	<DeleteModal
		entityName="organization study"
		onClose={toggleDeleteModal}
		on:delete={onOrganizationStudy}
	/>
{/if}

<style src="./style.scss"></style>

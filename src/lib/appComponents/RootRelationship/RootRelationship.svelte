<script>
	import Button from '@components/Button/Button.svelte';
	import Datatable from '@components/Datatables/Datatable.svelte';
	import {
		deleteRelationship,
		fetchRelationships,
		RELATIONSHIP_MAPPING,
		RELATIONSHIPS,
	} from '@models/relationships';
	import { deleteActiveIngredientMoA, fetchActiveIngredientList } from '@models/activeIngredient.js';
	import { queryConstructor } from '@utils/utility';
	import { onMount, createEventDispatcher } from 'svelte';
	import AddMechanismOfAction from './AddMechanismOfAction.svelte';
	import AddRelationship from './AddRelationship.svelte';
	import DeleteModal from '@components/Modal/DeleteModal/DeleteModal.svelte';
	import EditMechanismOfAction from './EditMechanismOfAction.svelte'
	import { toasts } from '@components/Toast/toasts';
	import { loader } from '@components/Loader/Loader';
	import { ROOT_LABELS } from '@models/roots.js';
	import { transformSnakeToCapitalized } from '@utils/utility';
	import { VERIFICATION_STATUS } from '@utils/constants.js';
	import EditRelationship from './EditRelationship.svelte';
	import Link from '@appComponents/CellComponents/Link.svelte';

	export let root;

	const dispatch = createEventDispatcher();

	let showAddModal = false;
	let size = 10;
	let showDeleteModal = false;
	let showEditModal = false;
	let showMoaAddModal = false;
	let showMoaEditModal = false;
	let showMoaDeleteModal = false;
	let selectedRelationship;
	let selectedMechanismOfAction;
	let isParentAdd = true;
	let hasEscalation = false;

	let columns = [
		{
			label: 'Id',
			value: 'id',
			tableName: 'id',
			sortable: true,
			searchable: true,
		},
		{
			label: 'Parent Root Name',
			value: 'parent_root_name',
			tableName: 'parent_root_name',
			sortable: true,
			searchable: true,
			cellComponent: Link,
			cellComponentProps: (row) => ({
				data: row.parent_root_name,
				href: `#/roots/${row.parent_root_id}`,
			}),
		},
		{
			label: 'Child Root Name',
			value: 'child_root_name',
			tableName: 'child_root_name',
			sortable: true,
			searchable: true,
			cellComponent: Link,
			cellComponentProps: (row) => ({
				data: row.child_root_name,
				href: `#/roots/${row.child_root_id}`,
			}),
		},
		{
			label: 'Relationship',
			value: 'relationship',
			tableName: 'relationship',
			searchable: true,
			searchType: 'SELECT',
			searchOptions: Object.values(RELATIONSHIPS).map((key) => {
				return {
					label: key,
					value: key,
				};
			}),
			width: 200
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
					handler: (relationship) => {
						selectedRelationship = relationship;
						toggleEditModal();
					},
				},
				{
					iconName: 'delete',
					handler: (relationship) => {
						selectedRelationship = relationship;
						toggleDeleteModal();
					},
				},
			],
		},
	];
	let mechanism_of_action_columns = [
		{
			label: 'Id',
			value: 'id',
			tableName: 'id',
		},
		{
			label: 'Mechanism of Action',
			value: 'mechanism_of_action',
			tableName: 'mechanism_of_action',
		},
		{
			label: 'Actions',
			value: 'ACTION',
			actions: [
				{
					iconName: 'edit',
					handler: (mechanismOfAction) => {
						selectedMechanismOfAction = mechanismOfAction;
						toggleMoaEditModal();
					},
				},
				{
					iconName: 'delete',
					handler: (mechanismOfAction) => {
						selectedMechanismOfAction = mechanismOfAction;
						toggleMoaDeleteModal();
					},
				},
			],
		},
	];

	let tableConfig = {
		parent: {
			searchTerm: '',
			sortBy: '',
			columnSearchQuery: [],
			hasNext: false,
			page: 1,
			loading: false,
			relationships: []
		},
		child: {
			searchTerm: '',
			sortBy: '',
			columnSearchQuery: [],
			hasNext: false,
			page: 1,
			loading: false,
			relationships: []
		},
		mechanism_of_action: {
			searchTerm: '',
			sortBy: 'id:asc',
			columnSearchQuery: [],
			hasNext: false,
			page: 1,
			loading: false,
			mechanism_of_action: []
		}
	}

	onMount(async () => {
		await fetchRelationshipsByRootId('', true);
		await fetchRelationshipsByRootId('', false);
		await fetchActiveIngredientByRootId('');
	});

	const fetchRelationshipsByRootId = async (
		searchTerm = '',
		isParent = true
	) => {
		let key = isParent? 'parent': 'child';
		let queryParam = [
			{
				key: isParent
					? 'parent_root_id'
					: 'child_root_id',
				operator: '==',
				value: root.id,
			},
		];
		let customSearchQuery = tableConfig[key].columnSearchQuery;
		if (customSearchQuery.length) {
				queryParam = [...queryParam, ...customSearchQuery]
		} 
		let relationships = [];
		let hasNext = false;
		let meta = {};
		try {
			tableConfig[key].loading = true;
			[relationships, hasNext, meta] = await fetchRelationships({
				page: tableConfig[key].page,
				size,
				search: searchTerm || '',
				query: queryConstructor(queryParam),
				sort_by: tableConfig[key].sortBy,
				overall_verification_status: true
			});
			tableConfig[key].hasNext = hasNext;
			hasEscalation = meta.escalated || false;
			dispatch('EscalateOverallStatus', {
				relationship: hasEscalation,
			});
		} catch (error) {
			console.warn(error);
			relationships = [];
			tableConfig[key].hasNext = false;
			toasts.error(error.message || 'An unexpected error occurred.');
		}
		tableConfig[key].relationships = relationships;
		tableConfig[key].loading = false;
	};

	const fetchActiveIngredientByRootId = async (
		searchTerm = '',
	) => {
		let key = 'mechanism_of_action'
		let queryParam = [
			{
				key: 'active_ingredient_root_id',
				operator: '==',
				value: root.id,
			},
		];
		let customSearchQuery = tableConfig[key].columnSearchQuery;
		if (customSearchQuery.length) {
			queryParam = [...queryParam, ...customSearchQuery]
		}
		let mechanism_of_action = [];
		let hasNext = false;
		try {
			tableConfig[key].loading = true;
			[mechanism_of_action, hasNext] = await fetchActiveIngredientList({
				page: tableConfig[key].page,
				size,
				search: searchTerm || '',
				query: queryConstructor(queryParam),
				sort_by: tableConfig[key].sortBy,
			});
			tableConfig[key].hasNext = hasNext;
		} catch (error) {
			console.warn(error);
			mechanism_of_action = []
			tableConfig[key].hasNext = false;
			toasts.error(error.message || 'An unexpected error occurred.');
		}
		tableConfig[key].mechanism_of_action = mechanism_of_action;
		tableConfig[key].loading = false;
	};

	const onDeleteRelationship = async () => {
		try {
			loader.show();
			await deleteRelationship(selectedRelationship.id);
			toasts.success('Relationship deleted successfully.');
			await refreshDatatable(
				selectedRelationship.parent_root_id === root.id
			);
			toggleDeleteModal();
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	};

	const onMoaDelete  = async () => {
		try {
			loader.show();
			await deleteActiveIngredientMoA(selectedMechanismOfAction.id);
			toasts.success('Mechanism of action deleted successfully.');
			await refreshMechanismOfActionTable(
				selectedMechanismOfAction.active_ingredient_root_id === root.id
			);
			toggleMoaDeleteModal();
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	}

	const refreshDatatable = async (isParent) => {
		await fetchRelationshipsByRootId(tableConfig[isParent? 'parent': 'child'].searchTerm, isParent);
		dispatch('RefreshAuditLog');
	};
	const refreshMechanismOfActionTable = async (isParent) => {
		await fetchActiveIngredientByRootId(tableConfig['mechanism_of_action'].searchTerm);
		dispatch('RefreshAuditLog');
	};

	const toggleAddModal = () => {
		showAddModal = !showAddModal;
	};
	const toggleDeleteModal = () => {
		showDeleteModal = !showDeleteModal;
	};
	const toggleEditModal = () => {
		showEditModal = !showEditModal;
	};
	const toggleMoaAddModal = () => {
		showMoaAddModal = !showMoaAddModal;
	};
	const toggleMoaEditModal = () => {
		showMoaEditModal = !showMoaEditModal;
	};
	const toggleMoaDeleteModal = () => {
		showMoaDeleteModal = !showMoaDeleteModal;
	};

	const onRelationshipSort = async (e, isParent = true) => {
		const sortDirection =
			e.detail.sortValue === 'ascending' ? 'asc' : 'desc';
		let key = isParent? 'parent': 'child';
		tableConfig[key].sortBy = `${e.detail.columnId}:${sortDirection}`;
		tableConfig[key].page = 1;
		await fetchRelationshipsByRootId(tableConfig[key].searchTerm, isParent);
	};

	const onRelationshipfilter = async (e, isParent = true) => {
		let key = isParent? 'parent': 'child';
		tableConfig[key].page = 1;
		await fetchRelationshipsByRootId(tableConfig[key].searchTerm, isParent);
	};

	const onMechanismOfActionFilter = async (e) => {
		let key = 'mechanism_of_action'
		tableConfig[key].page = 1;
		await fetchActiveIngredientByRootId(tableConfig[key].searchTerm);
	};
</script>

<section class="relationship">
	{#if RELATIONSHIP_MAPPING[root.label].child}
		<div class="relationship__inner">
			<div class="relationship__header">
				Root as a parent relationship
			</div>
			<div class="relationship__datatable">
				<Datatable
					{columns}
					hasNext={tableConfig['parent'].hasNext}
					loading={tableConfig['parent'].loading}
					data={tableConfig['parent'].relationships || []}
					bind:rowsPerPage={size}
					bind:currentPage={tableConfig['parent'].page}
					bind:searchTerm={tableConfig['parent'].searchTerm}
					bind:columnSearchQuery={tableConfig['parent'].columnSearchQuery}
					handleSort={(e) => {
						onRelationshipSort(e, true);
					}}
					handlefilter={(e) => {
						onRelationshipfilter(e, true);
					}}
					onPageChange={() =>
						fetchRelationshipsByRootId(
							tableConfig['parent'].searchTerm,
							true
						)}
					onGlobalSearch={(searchTerm) => {
						fetchRelationshipsByRootId(searchTerm, true);
					}}
				>
					<svelte:fragment slot="header-button">
						<Button
							type="secondary"
							onClick={() => {
								isParentAdd = true;
								toggleAddModal();
							}}
						>
							Add
						</Button>
					</svelte:fragment>
				</Datatable>
			</div>
		</div>
	{/if}
	{#if RELATIONSHIP_MAPPING[root.label].parent}
		<div class="relationship__inner">
			<div class="relationship__header">Root as a child relationship</div>
			<div class="relationship__datatable">
				<Datatable
					{columns}
					hasNext={tableConfig['child'].hasNext}
					loading={tableConfig['child'].loading}
					data={tableConfig['child'].relationships || []}
					bind:rowsPerPage={size}
					bind:currentPage={tableConfig['child'].page}
					bind:searchTerm={tableConfig['child'].searchTerm}
					bind:columnSearchQuery={tableConfig['child'].columnSearchQuery}
					handleSort={(e) => {
						onRelationshipSort(e, false);
					}}
					handlefilter={(e) => {
						onRelationshipfilter(e, false);
					}}
					onPageChange={() =>
						fetchRelationshipsByRootId(
							tableConfig['child'].searchTerm,
							false
						)}
					onGlobalSearch={(searchTerm) => {
						fetchRelationshipsByRootId(searchTerm, false);
					}}
				>
					<svelte:fragment slot="header-button">
						<Button
							type="secondary"
							onClick={() => {
								isParentAdd = false;
								toggleAddModal();
							}}
						>
							Add
						</Button>
					</svelte:fragment>
				</Datatable>
			</div>
		</div>
	{/if}
	{#if root.label == ROOT_LABELS.ACTIVE_INGREDIENT}
		<div class="mechanism_of_action">
			<div class="relationship__header">Mechanism of Action</div>
			<div class="relationship__datatable">
				<Datatable
					columns={mechanism_of_action_columns}
					hasNext={tableConfig['mechanism_of_action'].hasNext}
					loading={tableConfig['mechanism_of_action'].loading}
					data={tableConfig['mechanism_of_action'].mechanism_of_action || []}
					bind:rowsPerPage={size}
					bind:currentPage={tableConfig['mechanism_of_action'].page}
					bind:searchTerm={tableConfig['mechanism_of_action'].searchTerm}
					bind:columnSearchQuery={tableConfig['mechanism_of_action'].columnSearchQuery}
					disableGlobalSearch={true}
					handlefilter={(e) => {
						onMechanismOfActionFilter(e);
					}}
					onPageChange={() =>
						fetchActiveIngredientByRootId(tableConfig['mechanism_of_action'].searchTerm)
					}
				>
					<svelte:fragment slot="header-button">
						<Button
							type="secondary"
							onClick={toggleMoaAddModal}
						>
							Add
						</Button>
					</svelte:fragment>
				</Datatable>
			</div>
		</div>
	{/if}
</section>

{#if showAddModal}
	<AddRelationship
		{root}
		{isParentAdd}
		{refreshDatatable}
		onClose={toggleAddModal}
	/>
{/if}
{#if showDeleteModal}
	<DeleteModal
		entityName="relationship"
		onClose={toggleDeleteModal}
		on:delete={onDeleteRelationship}
	/>
{/if}
{#if showEditModal}
	<EditRelationship
		{root}
		{refreshDatatable}
		relationship={selectedRelationship}
		onClose={toggleEditModal}
	/>
{/if}

{#if showMoaAddModal}
	<AddMechanismOfAction
		{root}
		{refreshMechanismOfActionTable}
		onClose={toggleMoaAddModal}
	/>
{/if}
{#if showMoaEditModal}
	<EditMechanismOfAction
		{refreshMechanismOfActionTable}
		data={selectedMechanismOfAction}
		onClose={toggleMoaEditModal}
	/>
{/if}
{#if showMoaDeleteModal}
	<DeleteModal
		entityName="mechanism of action"
		onClose={toggleMoaDeleteModal}
		on:delete={onMoaDelete}
	/>
{/if}

<style src="./style.scss"></style>

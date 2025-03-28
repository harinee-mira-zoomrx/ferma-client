<script>
	import Button from '@components/Button/Button.svelte';
	import Datatable from '@components/Datatables/Datatable.svelte';
	import Input from '@components/Input/Input.svelte';
	import { debounce, queryConstructor } from '@utils/utility';
	import { onMount } from 'svelte';
	import DeleteModal from '@components/Modal/DeleteModal/DeleteModal.svelte';
	import AddEditSales from './AddEditSales.svelte';
	import { deleteDrugSale, fetchDrugSales } from '@models/sales';
	import { toasts } from '@components/Toast/toasts';
	import { loader } from '@components/Loader/Loader';

	export let organization;
	export let brand;
	let page = 1;
	let size = 10;
	let sales = [];
	let hasNext = false;
	let showAddModal = false;
	let showEditModal = false;
	let showDeleteModal = false;
	let searchTerm = '';
	let selectedSale;
	let showViewModal = false;
	let isDatatableLoading = false;
	let sortBy = '';
	let columnSearchQuery = [];
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
			label: 'Brand Label',
			value: 'brand_label',
			tableName: 'brand_label',
			sortable: true,
			searchable: true,
		},
		{
			label: 'Time Period',
			value: 'time_period',
			tableName: 'sale_time_period',
			sortable: true,
			searchable: true,
		},
		{
			label: 'Geography',
			value: 'geography',
			tableName: 'sale_geography',
			sortable: true,
			searchable: true,
		},
		{
			label: 'Currency',
			value: 'currency',
			tableName: 'sale_currency',
			sortable: true,
			searchable: true,
		},
		{
			label: 'Sales',
			value: 'sales',
			tableName: 'sale_sales',
			sortable: true,
			searchable: true,
		},
		{
			label: 'Sales USD',
			value: 'sales_usd',
			tableName: 'sale_sales_usd',
			sortable: true,
			searchable: true,
		},
		{
			label: 'URL',
			value: 'url',
			tableName: 'sale_url',
			sortable: true,
			searchable: true,
		},
		{
			label: 'Page Number',
			value: 'page_number',
			tableName: 'sale_page_number',
			sortable: true,
			searchable: true,
		},
		{
			label: 'Actions',
			value: 'ACTION',
			actions: [
				{
					iconName: 'visibility',
					title:'view',
					handler: (sale) => {
						selectedSale = sale;
						toggleViewModal();
					},
				},
				{
					iconName: 'edit',
					handler: (sale) => {
						selectedSale = sale;
						toggleEditModal();
					},
				},
				{
					iconName: 'delete',
					handler: (sale) => {
						selectedSale = sale;
						toggleDeleteModal();
					},
				},
			],
		},
	];

	onMount(async () => {
		await fetchSalesByOrgBrand();
	});
	const fetchSalesByOrgBrand = async (searchTerm = '') => {
		try {
			let queryParam = [
				{
					key: 'organization_root_id',
					operator: '==',
					value: organization.id,
				},
				{
					key: 'brand_root_id',
					operator: '==',
					value: brand?.id || 'None',
				},
				...columnSearchQuery,
			];
			isDatatableLoading = true;
			[sales, hasNext] = await fetchDrugSales({
				page,
				size,
				search: searchTerm || '',
				query: queryConstructor(queryParam),
				sort_by: sortBy,
			});
		} catch (error) {
			console.warn(error);
			sales = [];
			hasNext = false;
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			isDatatableLoading = false;
		}
		return sales;
	};
	const onDeleteSale = async () => {
		try {
			loader.show();
			await deleteDrugSale(selectedSale.id);
			await refreshDatatable();
			toasts.success('Sale deleted successfully.');
			toggleDeleteModal();
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	};
	const refreshDatatable = async () => {
		await fetchSalesByOrgBrand(searchTerm);
	};
	const toggleAddModal = () => {
		showAddModal = !showAddModal;
	};
	const onSalesSort = async (e) => {
		const sortDirection =
			e.detail.sortValue === 'ascending' ? 'asc' : 'desc';
		sortBy = `${e.detail.columnId}:${sortDirection}`;
		page = 1;
		await fetchSalesByOrgBrand(searchTerm);
	};
	const onSalesfilter = async (e) => {
		page = 1;
		await fetchSalesByOrgBrand(searchTerm);
	};
</script>

<section class="sale">
	<div class="sale__header">Sales</div>
	<div class="sale__datatable">
		<Datatable
			{columns}
			{hasNext}
			data={sales}
			loading={isDatatableLoading}
			handleSort={onSalesSort}
			handlefilter={onSalesfilter}
			bind:searchTerm
			bind:columnSearchQuery
			bind:rowsPerPage={size}
			bind:currentPage={page}
			onPageChange={() => fetchSalesByOrgBrand(searchTerm)}
			onGlobalSearch={fetchSalesByOrgBrand}
		>
			<svelte:fragment slot="header-button">
				<Button type="secondary" onClick={toggleAddModal}>Add</Button>
			</svelte:fragment>
		</Datatable>
	</div>
</section>
{#if showEditModal}
	<AddEditSales
		{brand}
		{organization}
		{refreshDatatable}
		sale={selectedSale}
		onClose={toggleEditModal}
	/>
{/if}
{#if showViewModal}
	<AddEditSales
		{brand}
		{organization}
		{refreshDatatable}
		sale={selectedSale}
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
	</AddEditSales>
{/if}
{#if showDeleteModal}
	<DeleteModal
		entityName="sale"
		onClose={toggleDeleteModal}
		on:delete={onDeleteSale}
	/>
{/if}
{#if showAddModal}
	<AddEditSales
		{brand}
		{organization}
		sale={null}
		{refreshDatatable}
		onClose={toggleAddModal}
	/>
{/if}

<style src="./style.scss"></style>

<script>
	import DynamicForm from '@components/DynamicForm/DynamicForm.svelte';
	import { loader } from '@components/Loader/Loader';
	import Modal from '@components/Modal/Modal.svelte';
	import { toasts } from '@components/Toast/toasts';
	import { createDrugSale, updateDrugSale } from '@models/sales';
	import { COMPONENT_TYPES } from '@utils/constants';
	import { validateURL } from '@utils/utility';
	export let onClose;
	export let sale;
	export let isViewOnly = false;
	export let organization;
	export let brand;
	export let refreshDatatable = () => {};
	let config = [
		{
			type: COMPONENT_TYPES.TEXTBOX,
			props: {
				label: 'Organization',
				value: organization?.name,
			},
		},
		{
			type: COMPONENT_TYPES.TEXTBOX,
			props: {
				label: 'Brand',
				value: brand?.name,
			},
		},
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				name: 'brand_label',
				label: 'Brand Label',
				placeholder: 'Enter brand label',
				width: '100%',
				disabled: isViewOnly,
				value: sale?.brand_label,
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				name: 'url',
				label: 'URL',
				placeholder: 'Enter url',
				width: '100%',
				disabled: isViewOnly,
				value: sale?.url,
				required: true,
			},
			validation: (url) => {
				if (['Unknown'].includes(url) || validateURL(url)) return true;
				toasts.warn('Please provide a valid url.');
				return false;
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'time_period',
				label: 'Time Period',
				placeholder: 'Enter time period',
				disabled: isViewOnly,
				value: sale?.time_period,
				required: true,
			},
			validation: (timePeriod) => {
				if (/^(?:FY)?\d{4}(?:-Q[1-4])?$/.test(timePeriod)) return true;
				toasts.warn(
					'Please provide a valid time period. Eg: FY2023, 2023, 2023-Q1, FY2023-Q1'
				);
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'geography',
				label: 'Geography',
				placeholder: 'Enter geography',
				disabled: isViewOnly,
				value: sale?.geography,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'currency',
				label: 'Currency Code',
				placeholder: 'Enter currency code',
				disabled: isViewOnly,
				value: sale?.currency,
				required: true,
			},
			validation: (currencyCode) => {
				if (/^[A-Z]{3}$/.test(currencyCode)) return true;
				toasts.warn('Please provide a valid currency code.');
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'sales',
				label: 'Sales',
				placeholder: 'Enter sales',
				type: 'number',
				disabled: isViewOnly,
				value: sale?.sales,
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'sales_usd',
				label: 'Sales USD',
				placeholder: 'Enter USD',
				type: 'number',
				disabled: isViewOnly,
				value: sale?.sales_usd,
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'page_number',
				label: 'Page Number',
				placeholder: 'Enter page number',
				disabled: isViewOnly,
				value: sale?.page_number,
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.BUTTON,
			props: [
				{
					name: 'Save',
					type: 'primary',
					buttonType: 'submit',
				},
			],
		},
	];
	if (isViewOnly) {
		config.length = config.length - 1;
		config = config;
	}
	async function onUpdateDrugSale(e) {
		try {
			loader.show();
			await updateDrugSale(sale.id, e.detail);
			await refreshDatatable();
			toasts.success('Sale updated successfully');
			onClose();
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	}
	async function addDrugSale(e) {
		try {
			loader.show();
			await createDrugSale({
				...e.detail,
				organization_root_id: organization.id,
				brand_root_id: brand.id,
			});
			await refreshDatatable();
			toasts.success('Sale created successfully');
			onClose();
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	}
	function onSubmit(e) {
		if (sale) {
			onUpdateDrugSale(e);
		} else {
			addDrugSale(e);
		}
	}
</script>

<Modal
	title={(sale ? (isViewOnly ? 'View' : 'Edit') : 'Add') + ' Sale'}
	showModal={true}
	{onClose}
>
	<svelte:fragment slot="modal-header-actions">
		<slot />
	</svelte:fragment>
	<svelte:fragment slot="content">
		<DynamicForm {config} showEditedValues={!!sale} columns={3} on:submit={onSubmit} />
	</svelte:fragment>
</Modal>

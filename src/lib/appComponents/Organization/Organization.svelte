<script>
	import DynamicForm from '@components/DynamicForm/DynamicForm.svelte';
	import { loader } from '@components/Loader/Loader';
	import { toasts } from '@components/Toast/toasts';
	import {
		ORGANIZATION_SIZE,
		ORGANIZATION_STAGE,
		ORGANIZATION_TYPE,
		createOrganization,
		fetchOrganization,
		updateOrganization,
	} from '@models/organization';
	import { COMPONENT_TYPES, VERIFICATION_STATUS } from '@utils/constants';
	import { validateJSON, validateURL } from '@utils/utility';
	import { onMount, createEventDispatcher } from 'svelte';
	import { transformSnakeToCapitalized } from '@utils/utility';
	import isEmpty from '@utils/is-empty';

	export let organization;

	const dispatch = createEventDispatcher();
	let selectedOrganization = null;
	let organizationInputValue = null;
	let pendingFormData = null;

	$: config = [
		{
			type: COMPONENT_TYPES.SEGMENT_PILL,
			props: {
				name: 'type',
				label: 'Type',
				// placeholder: 'Select type',
				items: Object.values(ORGANIZATION_TYPE),
				value: organizationInputValue?.type,
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.SEGMENT_PILL,
			props: {
				name: 'is_active',
				label: 'Active Status',
				// placeholder: 'Select active status',
				items: [
					{
						label: 'Inactive',
						value: false,
					},
					{
						label: 'Active',
						value: true,
					},
				],
				value: ![null, undefined].includes(
					organizationInputValue?.is_active
				)
					? {
							label: organizationInputValue.is_active
								? 'Active'
								: 'Inactive',
							value: organizationInputValue.is_active,
						}
					: undefined,
			},
		},
		{
			type: COMPONENT_TYPES.SELECT_BOX,
			props: {
				name: 'size',
				label: 'Size',
				placeholder: 'Select size',
				items: Object.values(ORGANIZATION_SIZE),
				clearFilterTextOnBlur: true,
				value: organizationInputValue?.size,
			},
		},
		{
			type: COMPONENT_TYPES.SELECT_BOX,
			props: {
				name: 'stage',
				label: 'Stage',
				placeholder: 'Select stage',
				items: Object.values(ORGANIZATION_STAGE),
				clearFilterTextOnBlur: true,
				value: organizationInputValue?.stage,
			},
		},
		{
			type: COMPONENT_TYPES.SEGMENT_PILL,
			props: {
				name: 'is_public',
				label: 'Public Status',
				// placeholder: 'Select public status',
				items: [
					{
						label: 'Private',
						value: false,
					},
					{
						label: 'Public',
						value: true,
					},
				],
				value: ![null, undefined].includes(
					organizationInputValue?.is_public
				)
					? {
							label: organizationInputValue.is_public
								? 'Public'
								: 'Private',
							value: organizationInputValue.is_public,
						}
					: undefined,
			},
		},
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				name: 'website',
				label: 'Website URL',
				placeholder: 'Enter website url',
				value: organizationInputValue?.website,
			},
			validation: (url) => {
				if (['Unknown'].includes(url) || validateURL(url)) {
					return true;
				}
				toasts.warn('Please provide a valid website url.');
				return false;
			},
		},
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				name: 'pipeline_url',
				label: 'Pipeline URL',
				placeholder: 'Enter pipeline url',
				value: organizationInputValue?.pipeline_url,
			},
			validation: (url) => {
				if (['Unknown'].includes(url) || validateURL(url)) {
					return true;
				}
				toasts.warn('Please provide a valid pipeline url.');
				return false;
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'permalink',
				label: 'Permalink',
				placeholder: 'Enter permalink',
				value: organizationInputValue?.permalink,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'market_capital',
				label: 'Market Capital',
				placeholder: 'Enter market capital',
				value: organizationInputValue?.market_capital,
			},
			validation: (value) => {
				if (/^\d+|Not Applicable$/.test(value)) {
					return true;
				}
				toasts.warn(
					'Please provide a valid market capital or "Not Applicable".'
				);
				return false;
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'market_capital_currency',
				label: 'Market Capital Currency',
				placeholder: 'Enter market capital currency',
				value: organizationInputValue?.market_capital_currency,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'num_of_employees',
				label: 'Number of Employees',
				placeholder: 'Enter number of employees',
				value: organizationInputValue?.num_of_employees,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'stock_exchange',
				label: 'Stock Exchange',
				placeholder: 'Enter stock exchange',
				value: organizationInputValue?.stock_exchange,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'stock_ticker',
				label: 'Stock Ticker',
				placeholder: 'Enter stock ticker',
				value: organizationInputValue?.stock_ticker,
			},
		},
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				name: 'address',
				label: 'Address(JSON)',
				placeholder: 'Enter address as JSON',
				value: organizationInputValue?.address,
			},
			validation: (json) => {
				if (json === null || validateJSON(json)) return true;
				toasts.warn('Please provide a valid Address as JSON');
			},
		},
		{
			type: COMPONENT_TYPES.SEGMENT_PILL,
			props: {
				name: 'is_solved',
				label: 'Solved',
				// placeholder: 'Select solved status',
				items: [
					{
						label: 'Unsolved',
						value: false,
					},
					{
						label: 'Solved',
						value: true,
					},
				],
				value: ![null, undefined].includes(
					organizationInputValue?.is_solved
				)
					? {
							label: organizationInputValue.is_solved
								? 'Solved'
								: 'Unsolved',
							value: organizationInputValue.is_solved,
						}
					: undefined,
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.SEGMENT_PILL,
			props: {
				name: 'verification_status',
				label: 'Verification Status',
				items: Object.values(VERIFICATION_STATUS).map((key) => {
					return {
						label: transformSnakeToCapitalized(key),
						value: key,
					};
				}),
				value: organizationInputValue?.verification_status,
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				label: 'Comment',
				value: organizationInputValue?.comment,
				placeholder: 'Enter a comment',
				name: 'comment',
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
	onMount(async () => {
		try {
			loader.show();
			selectedOrganization = await fetchOrganization(organization.id);
			organizationInputValue = { ...selectedOrganization}
		} catch (error) {
			selectedOrganization = null;
			organizationInputValue = null;
		} finally {
			loader.hide();
		}
	});
	async function onUpdateOrganization(e) {
		try {
			loader.show();
			Object.keys(e.detail).forEach(key => {
				if (organizationInputValue.hasOwnProperty(key)) {
					organizationInputValue[key] = e.detail[key];
				}
			});

			let formData = {
				...e.detail
			};

			if (!isEmpty(pendingFormData)) {
				formData = { ...pendingFormData, ...formData };
			}
			pendingFormData = formData;
			const { verification_status, comment } = organizationInputValue;
			if (
				verification_status === VERIFICATION_STATUS.ESCALATED &&
				isEmpty(comment)
			) {
				toasts.error(
					'Comment cannot be empty when status is Escalated.'
				);
				return;
			}
			await updateOrganization(selectedOrganization.id, formData);
			pendingFormData = null;
			onOrgUpdate(formData);
			dispatch('RefreshAuditLog');
			toasts.success('Organization updated successfully');
		} catch (error) {
			onOrgUpdate(selectedOrganization);
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	}
	async function onAddOrganization(e) {
		try {
			loader.show();
			const orgData = await createOrganization({
				organization_root_id: organization.id,
				...e.detail,
			});
			onOrgUpdate(orgData);
			dispatch('RefreshAuditLog');
			toasts.success('Organization created successfully');
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	}
	function onOrgUpdate(orgData) {
		selectedOrganization = {
			...selectedOrganization,
			...orgData,
		};
	}
	function onSubmit(e) {
		if (selectedOrganization) {
			onUpdateOrganization(e);
		} else {
			onAddOrganization(e);
		}
	}
</script>

<div class="header">Organization</div>
<DynamicForm
	{config}
	columns={3}
	showEditedValues={!!selectedOrganization}
	on:submit={onSubmit}
/>

<style lang="scss">
	.header {
		font-size: 20px;
		margin-bottom: 15px;
	}
</style>

<script>
	import DynamicForm from '@components/DynamicForm/DynamicForm.svelte';
	import { loader } from '@components/Loader/Loader';
	import Modal from '@components/Modal/Modal.svelte';
	import { toasts } from '@components/Toast/toasts';
    import { INSIGHT_STATUS } from '@models/insightsMaster';
	import { COMPONENT_TYPES } from '@utils/constants';
	import { updateStatus } from '@models/insightsMaster';
	import isEmpty from '@utils/is-empty';

	export let data = {}
	export let onClose;
	export let refreshDatatable = () => {};
	const config = [
		{
			type: COMPONENT_TYPES.TEXTBOX,
			props: {
				label: 'ID',
				value: data.id,
			},
		},
		{
			type: COMPONENT_TYPES.SELECT_BOX,
			props: {
				name: 'workflow_category_kg',
				label: 'KG Workflow Status',
				value:  INSIGHT_STATUS.find(status => status.value === data.workflow_category_kg),
				placeholder: 'Select Status',
				items: INSIGHT_STATUS,
				clearable: false,
				clearFilterTextOnBlur: true,
			},
		},
		{
			type: COMPONENT_TYPES.SELECT_BOX,
			props: {
				name: 'workflow_category_firm',
				label: 'Firm Workflow Status',
				value: INSIGHT_STATUS.find(status => status.value === data.workflow_category_firm),
				placeholder: 'Select Status',
				items: INSIGHT_STATUS,
				clearable: false,
				clearFilterTextOnBlur: true,
			},
		},
		{
			type: COMPONENT_TYPES.SELECT_BOX,
			props: {
				name: 'workflow_category_drug',
				label: 'Drug Workflow Status',
				value: INSIGHT_STATUS.find(status => status.value === data.workflow_category_drug),
				placeholder: 'Select Status',
				items: INSIGHT_STATUS,
				clearable: false,
				clearFilterTextOnBlur: true,
			},
		},
		{
			type: COMPONENT_TYPES.SELECT_BOX,
			props: {
				name: 'workflow_category_trial',
				label: 'Trial Workflow Status',
				value: INSIGHT_STATUS.find(status => status.value === data.workflow_category_trial),
				placeholder: 'Select Status',
				items: INSIGHT_STATUS,
				clearable: false,
				clearFilterTextOnBlur: true,
			},
		},
		{
			type: COMPONENT_TYPES.BUTTON,
			props: [
				{
					buttonType: 'submit',
					type: 'primary',
					name: 'Save',
				},
			],
		},
	];
	
	async function onSubmit(e) {
		let dataToSubmit = {}
		const fieldsToCheck = ['workflow_category_kg', 'workflow_category_firm', 'workflow_category_drug', 'workflow_category_trial'];
		fieldsToCheck.forEach(field => {
			if (!isEmpty(e.detail[field]) && e.detail[field] !== data[field]) {
				dataToSubmit[field] = e.detail[field];
			}
		})
		if (isEmpty(dataToSubmit) ) {
			toasts.warn('No change detected. Please select the updated status.');
			return;
		}
		try {
			loader.show();
			await updateStatus(data.id, dataToSubmit);
			await refreshDatatable();
			toasts.success('Status updated successfully');
			onClose();
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	}
</script>

<Modal
	title={'Edit Insights Master'}
	showModal={true}
	{onClose}
>
	<svelte:fragment slot="content">
		<DynamicForm {config} on:submit={onSubmit} />
	</svelte:fragment>
</Modal>

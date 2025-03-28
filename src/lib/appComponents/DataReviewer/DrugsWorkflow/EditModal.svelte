<script>
	import DynamicForm from '@components/DynamicForm/DynamicForm.svelte';
	import { loader } from '@components/Loader/Loader';
	import Modal from '@components/Modal/Modal.svelte';
	import { toasts } from '@components/Toast/toasts';
	import { RELATIONSHIP_STATUS } from '@models/drugsWorkflow';
	import { COMPONENT_TYPES } from '@utils/constants';
	import { updateStatus } from '@models/drugsWorkflow';

	export let data = {}
	export let onClose;
	export let refreshDatatable = () => {};
	export let from;

	const STATUS_ALLOWED_FOR_UPDATE = ['INVALID','VERIFIED'];
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
				name: 'status',
				label: 'Status',
				value: data?.status,
				placeholder: 'Select Status',
				items: RELATIONSHIP_STATUS.filter(status => STATUS_ALLOWED_FOR_UPDATE.includes(status.value) || status.value === data.status),
                required: true,
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
		if (!e.detail.status || e.detail.status === data.status) {
			toasts.warn(
				'No status change detected. Please select the updated status.'
			);
			return;
		}
		try {
			loader.show();
			await updateStatus(data.id, {
				status: e.detail.status,
			});
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
	title={`Edit ${from? from : "Drugs"} Workflow`}
	showModal={true}
	{onClose}
>
	<svelte:fragment slot="content">
		<DynamicForm {config} on:submit={onSubmit} />
	</svelte:fragment>
</Modal>

<script>
	import DynamicForm from '@components/DynamicForm/DynamicForm.svelte';
	import { loader } from '@components/Loader/Loader';
	import Modal from '@components/Modal/Modal.svelte';
	import { toasts } from '@components/Toast/toasts';
    import { FIELD_STATUS } from '@models/kgWorkflow';
	import { COMPONENT_TYPES } from '@utils/constants';
	import { updateStatus } from '@models/kgWorkflow';
	import Button from '@components/Button/Button.svelte';

	export let data = {}
	export let onClose;
	export let refreshDatatable = () => {};
	export let from;

	let askConfirmation = false;
	let status = '';

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
				items: FIELD_STATUS.filter(status => STATUS_ALLOWED_FOR_UPDATE.includes(status.value) || status.value === data.status),
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
		status = e.detail.status;
		if (from) {
			handleUpdateStatus()
		} else {
			askConfirmation = true;
		}
	}

	async function handleUpdateStatus() {
		try {
			loader.show();
			await updateStatus(data.id, { status });
			await refreshDatatable();
			toasts.success('Status updated successfully');
			onClose();
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
			resetConfirmation();
		}
	}

	const resetConfirmation = () => {
		status = '';
		askConfirmation = false;
	}

	const getStatusLabel = (value) => {
		return FIELD_STATUS.find(s => s.value === value).label;
	}

</script>

<Modal
	title={`Edit ${from? from : "KG"} Workflow`}
	showModal={true}
	{onClose}
>
	<svelte:fragment slot="content">
		{#if !askConfirmation}
		<DynamicForm {config} on:submit={onSubmit} />
		{:else}
		<div class="user-confirmation">
			<p>Are you sure you want to change the status from <b>{getStatusLabel(data.status)}</b> to <b>{getStatusLabel(status)}</b> ?</p>
			<div class="user-confirmation__options">
				<Button type="secondary" onClick={resetConfirmation}>Cancel</Button>
				<Button type="primary" onClick={handleUpdateStatus}>Confirm</Button>
			</div>
		</div>
		{/if}
	</svelte:fragment>
</Modal>

<style>
	.user-confirmation {
		width: 300px;
	}
	.user-confirmation__options {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 15px;
	}
</style>

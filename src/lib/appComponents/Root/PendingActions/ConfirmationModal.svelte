<script>
	import Button from '@components/Button/Button.svelte';
	import Modal from '@components/Modal/Modal.svelte';
	import { transformSnakeToCapitalized } from '@utils/utility';
	import { PENDING_ACTIONS } from '@models/pendingActions';

	export let action;
	export let operation;
	export let onClose;
	export let onConfirm;

	const handleConfirm = () => {
		onConfirm(action, operation);
	};
</script>

<Modal title="Confirm {transformSnakeToCapitalized(operation)}" showModal={true} showClose={true} {onClose}>
	<svelte:fragment slot="content">
		<div class="modal-content">
			{#if operation === PENDING_ACTIONS.MERGE}
				<p>
					Are you sure you want to merge <strong
						>{action.root_name}</strong
					>
				</p>
			{:else if operation === PENDING_ACTIONS.LABEL_CHANGE}
				<p>
					Are you sure you want to change label to <strong
						>{action.value_1}</strong
					>
				</p>
			{:else}
				<p>Are you sure you want to invalidate</p>
			{/if}
		</div>
		<div class="modal-actions">
			<Button type="primary" onClick={handleConfirm}>Confirm</Button>
		</div>
	</svelte:fragment>
</Modal>

<style>
	.modal-content {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 16px 0;
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
		padding-top: 16px;
	}

	p {
		margin: 0;
		font-size: 16px;
		color: #333;
	}
</style>

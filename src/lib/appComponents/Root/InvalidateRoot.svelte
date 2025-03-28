<script>
	import { createEventDispatcher } from 'svelte';
	import Modal from '@components/Modal/Modal.svelte';
	import Button from '@components/Button/Button.svelte';
	import { loader } from '@components/Loader/Loader';
	import { toasts } from '@components/Toast/toasts';
	import { invalidateRoot } from '@models/roots';
	import {
		createPendingAction,
		PENDING_ACTIONS,
		PENDING_ACTIONS_ENTITY,
	} from '@models/pendingActions';
	import Textarea from '@components/Textarea/Textarea.svelte';
	import isEmpty from '@utils/is-empty';
	import {  push } from 'svelte-spa-router';

	export let root;
	export let onClose = () => {};
	export let isLeadUser = false;

	const dispatch = createEventDispatcher();

	let confirmVisitedLandscape = false;
	let comment = '';

	const confirmSubmit = async () => {
		try {
			loader.show();
			if (isLeadUser) {
				await invalidateRoot(root.id);
				toasts.success('Root marked as invalid successfully');
				push('/roots');
			} else {
				await createPendingAction({
					entity: PENDING_ACTIONS_ENTITY.ROOTS,
					entity_id: root.id,
					action: PENDING_ACTIONS.INVALID,
					comment: comment,
					value_1: "true",
				});
				toasts.success(
					'Invalidation action has been submitted for approval.'
				);
				dispatch('invalidateRoot');
			}
			onClose();
		} catch (error) {
			toasts.error(error.message || 'Failed to invalidate the root. Please try again.');
			console.error(error);
		} finally {
			comment = '';
			loader.hide();
		}
	};
</script>

<Modal title="Confirm Invalidate" showModal={true} {onClose}>
	<svelte:fragment slot="content">
		<div class="modal-content">
			<p>
				Are you sure you want to mark <strong>{root.name}</strong> as invalid? {#if !isLeadUser}Please provide a
				reason as a comment.{/if}
			</p>
			<div class="checkbox-container">
				<input
					type="checkbox"
					id="confirmVisited"
					bind:checked={confirmVisitedLandscape}
				/>
				<label for="confirmVisited">
					I confirm that I have visited the landscape detail of this
					root before marking it as invalid.
				</label>
			</div>
			{#if !isLeadUser}
			<Textarea
					value={comment}
					placeholder="Enter your comment"
					label="Comment"
					name="comment"
					required={true}
					onInput={(e) => (comment = e.target.textContent)}
				/>
			{/if}
		</div>
		<div class="modal-actions">
			<Button
				type="primary"
				onClick={confirmSubmit}
				disabled={!confirmVisitedLandscape || (!isLeadUser && isEmpty(comment))}
			>
				Confirm
			</Button>
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

	.checkbox-container {
		margin-top: 20px;
		text-align: left;
	}
</style>

<script>
	import Modal from '@components/Modal/Modal.svelte';
	import Button from '@components/Button/Button.svelte';
	import isEmpty from '@utils/is-empty';
	import Textarea from '@components/Textarea/Textarea.svelte';

	export let onClose = () => {};
	export let onSubmit;
	export let term;
	export let comment = '';

	$: newComment = comment; // To store new comment entered by the user
</script>

<Modal title="Re-add Invalid Root" showModal={true} {onClose}>
	<svelte:fragment slot="content">
		<div class="modal-content">
			<p>
				<strong>{term}</strong> is marked invalid. Please update the comment to re-add it.
			</p>
			<Textarea
				value={newComment}
				placeholder="Enter your comment"
				label="Comment"
				name="comment"
				required={true}
				onInput={(e) => (newComment = e.target.textContent)}
			/>
		</div>
		<div class="modal-actions">
			<Button
				type="primary"
				onClick={() => onSubmit(newComment)}
				disabled={isEmpty(newComment)}
			>
				Submit
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
</style>

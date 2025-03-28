<script>
	import Button from '@components/Button/Button.svelte';
	import Textarea from '@components/Textarea/Textarea.svelte';
	import Modal from '@components/Modal/Modal.svelte';
	import isEmpty from '@utils/is-empty';

	export let isLeadUser = false;
	export let selectedRoot = {};
	export let mainRoot = {};
	export let comment = '';
	export let onClose;
	export let onConfirm;

	const handleConfirm = () => {
		onConfirm(comment);
	};
</script>

<Modal title="Confirm Merge" showModal={true} showClose={true} {onClose}>
	<svelte:fragment slot="content">
		<div class="modal-content">
			{#if isLeadUser}
				<p>
					Are you sure you want to merge <strong
						>{selectedRoot?.data.name}</strong
					>
					with <strong>{mainRoot?.name}</strong>?
				</p>
			{:else}
				<p>
					Are you sure you want to merge <strong
						>{selectedRoot?.data.name}</strong
					>
					with <strong>{mainRoot?.name}</strong>? Please provide a
					reason as a comment.
				</p>
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
			<Button type="secondary" onClick={onClose}>Cancel</Button>
			<Button
				type="primary"
				disabled={!isLeadUser && isEmpty(comment)}
				onClick={handleConfirm}>Confirm</Button
			>
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

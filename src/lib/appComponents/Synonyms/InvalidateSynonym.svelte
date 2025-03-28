<script>
	import Button from '@components/Button/Button.svelte';
	import Modal from '@components/Modal/Modal.svelte';
	import { createEventDispatcher } from 'svelte';
	import Alert from '@components/Alert/Alert.svelte';

	export let synonym = {};
	export let onClose;
	export let alertMessage = null;

	const dispatch = createEventDispatcher();
	const onInvalidate = () => {
		dispatch('invalidate');
	};
</script>

<Modal showModal={true} showClose={false} {onClose}>
	<div slot="content" class="delete">
		<p>Are you sure you want to mark <strong>{synonym.name}</strong> as invalid?</p>
		<div class="delete__actions">
			<Button type="secondary" onClick={onClose}>Cancel</Button>
			<Button type="primary" onClick={onInvalidate}>Invalid</Button>
		</div>
		<div>
			{#if alertMessage}
				<Alert severity="warning" message={alertMessage}></Alert>
			{/if}
		</div>
	</div>
</Modal>

<style lang="scss">
	.delete {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 20px;

		&__actions {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 20px;
		}
	}
</style>

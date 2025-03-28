<!-- Modal.svelte -->
<script>
	import IconButton from '@smui/icon-button';
	export let title = '';
	export let showClose = true;
	export let onClose = () => {};
	export let showModal = false;
	let overlay;
	function closeModal() {
		showModal = false;
	}
	function handleClickOutside(event) {
		if (event.target === overlay) {
			closeModal();
			onClose();
		}
	}
</script>

{#if showModal}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="modal-overlay"
		bind:this={overlay}
		on:click|stopPropagation={handleClickOutside}
	>
		<div class="modal" on:click|stopPropagation>
			{#if showClose || title}
				<div class="modal__header">
					<div class="modal__header-title">
						{#if title}
							{title}
						{/if}
						<div class="modal__header-actions">
							<slot name="modal-header-actions" />
						</div>
					</div>

					{#if showClose}
						<!-- svelte-ignore missing-declaration -->
						<IconButton
							class="material-icons toast__close"
							ripple={false}
							on:click={() => {
								closeModal();
								onClose();
							}}
						>
							close
						</IconButton>
					{/if}
				</div>
			{/if}
			<div class="modal__content">
				<slot name="content" />
			</div>
		</div>
	</div>
{/if}

<style src="./style.scss">
</style>

<script>
	import PageContainer from '@components/PageContainer/PageContainer.svelte';
	import StudiesData from '@appComponents/StudiesData/StudiesData.svelte';
	import Modal from '@components/Modal/Modal.svelte';
	import Button from '@components/Button/Button.svelte';
	import AddTrials from '@appComponents/Trials/AddTrials.svelte';

	let showAddModal = false;
	let canShowAddModalPrompt = false;
	let refeshTable = 1;

	const toggleAddModal = () => {
		showAddModal = !showAddModal;
	};
</script>

<PageContainer title="Clinical Trials">
	<div slot="header" class="header-container">
		<Button
			type="secondary"
			onClick={() => {
				canShowAddModalPrompt = true;
			}}>Add Study</Button
		>
	</div>
	<svelte:fragment slot="content">
		{#key refeshTable}
			<StudiesData />
		{/key}
	</svelte:fragment>
</PageContainer>

{#if canShowAddModalPrompt}
	<Modal
		showModal={true}
		showClose={false}
		onClose={() => {
			canShowAddModalPrompt = false;
		}}
	>
		<div slot="content" class="add_study">
			Are you sure you want to add a new trial as this is a rare event?
			<div class="add_study__actions">
				<Button
					onClick={() => {
						canShowAddModalPrompt = false;
					}}
					type="secondary"
				>
					Cancel
				</Button>
				<Button
					type="primary"
					onClick={() => {
						showAddModal = true;
						canShowAddModalPrompt = false;
					}}
				>
					Add
				</Button>
			</div>
		</div>
	</Modal>
{/if}
{#if showAddModal}
	<AddTrials
		refreshData={() => {
			refeshTable += 1;
		}}
		onClose={toggleAddModal}
	/>
{/if}

<style src="./style.scss"></style>

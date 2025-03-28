<script>
	import PageContainer from '@components/PageContainer/PageContainer.svelte';
	import RootsTable from '@appComponents/RootsTable/RootsTable.svelte';
	import Button from '@components/Button/Button.svelte';
	import AddRoot from '@appComponents/Root/AddRoot.svelte';

	let showAddModal = false;
	let refeshTable = 1;
	const toggleAddModal = () => {
		showAddModal = !showAddModal;
	};
	const onRootAdd = () => {
		refeshTable = refeshTable + 1;
	};
</script>

<PageContainer title="Roots">
	<div slot="header" class="header-container">
		<Button type="secondary" onClick={toggleAddModal}>Add Root</Button>
	</div>

	<svelte:fragment slot="content">
		{#key refeshTable}
			<RootsTable />
		{/key}
	</svelte:fragment>
</PageContainer>

{#if showAddModal}
	<AddRoot onClose={toggleAddModal} onAdd={onRootAdd} />
{/if}

<style src="./style.scss"></style>

<script>
	import PageContainer from '@components/PageContainer/PageContainer.svelte';
	import BulkOperations from '@appComponents/BulkOperations/BulkOperations.svelte';
	import Button from '@components/Button/Button.svelte';
	import UploadFile from '@appComponents/BulkOperations/UploadFile.svelte';

	let showUploadFileModal = false;
	let isFileUploaded = false;

	const toggleUploadFileModal = () => {
		showUploadFileModal = !showUploadFileModal;
	};
</script>

<PageContainer title="Bulk Operations">
	<div slot="header">
		<div class="bulk-operations">
			<span class="bulk-operations__header-inner">
				<Button type="secondary" onClick={toggleUploadFileModal}>Upload File</Button>
			</span>
		</div>
	</div>
	<svelte:fragment slot="content">
		<BulkOperations bind:isFileUploaded/>
	</svelte:fragment>
</PageContainer>
{#if showUploadFileModal}
	<UploadFile onClose={toggleUploadFileModal} onFileUpload={() => isFileUploaded=true}/>
{/if}



<style src="./style.scss"></style>

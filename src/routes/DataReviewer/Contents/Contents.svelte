<script>
	import PageContainer from '@components/PageContainer/PageContainer.svelte';
	import Button from '@components/Button/Button.svelte';
	import Contents from '@appComponents/DataReviewer/Contents/Contents.svelte';
	import PDFUpload from '@appComponents/DataReviewer/Contents/PDFUpload.svelte';

	let showUploadFileModal = false;
	let isFileUploaded = false;

	const toggleUploadFileModal = () => {
		showUploadFileModal = !showUploadFileModal;
	};
</script>

<PageContainer title="Contents">
	<div slot="header">
		<div class="contents">
			<span class="contents__header-inner">
				<Button type="secondary" onClick={toggleUploadFileModal}>Upload File</Button>
			</span>
		</div>
	</div>
	<svelte:fragment slot="content">
		<Contents bind:isFileUploaded/>
	</svelte:fragment>
</PageContainer>
{#if showUploadFileModal}
	<PDFUpload onClose={toggleUploadFileModal} onFileUpload={() => isFileUploaded=true}/>
{/if}



<style src="./style.scss"></style>

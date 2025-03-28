<script>
	import PageContainer from '@components/PageContainer/PageContainer.svelte';
	import KgWorkflow from '@appComponents/DataReviewer/KGWorkflow/KGWorkflow.svelte';
</script>

<PageContainer title="KG Workflow">
	<svelte:fragment slot="content">
		<KgWorkflow />
	</svelte:fragment>
</PageContainer>

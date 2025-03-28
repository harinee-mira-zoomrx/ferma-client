<script>
	import PageContainer from '@components/PageContainer/PageContainer.svelte';
	import FirmsWorkflow from '@appComponents/DataReviewer/FirmsWorkflow/FirmsWorkflow.svelte';
</script>

<PageContainer title="Firms Workflow">
	<svelte:fragment slot="content">
		<FirmsWorkflow />
	</svelte:fragment>
</PageContainer>


<style src="./style.scss"></style>

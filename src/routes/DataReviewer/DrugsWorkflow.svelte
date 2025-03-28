<script>
	import PageContainer from '@components/PageContainer/PageContainer.svelte';
	import DrugsWorkflow from '@appComponents/DataReviewer/DrugsWorkflow/DrugsWorkflow.svelte';


</script>

<PageContainer title="Drugs Workflow">
	<svelte:fragment slot="content">
		<DrugsWorkflow />
	</svelte:fragment>
</PageContainer>



<style src="./style.scss"></style>

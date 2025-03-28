<script>

	import PageContainer from '@components/PageContainer/PageContainer.svelte';
	import InsightsMaster from '@appComponents/DataReviewer/InsightsMaster/InsightsMaster.svelte';

</script>

<PageContainer title="Insights Master">
	<svelte:fragment slot="content">
		<InsightsMaster />
	</svelte:fragment>
</PageContainer>



<style src="./style.scss"></style>

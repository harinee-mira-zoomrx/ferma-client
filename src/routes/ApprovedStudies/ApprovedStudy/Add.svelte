<script>
	import PageContainer from '@components/PageContainer/PageContainer.svelte';
	import AddApprovedStudy from '@appComponents/ApprovedStudies/AddApprovedStudy.svelte';
</script>

<PageContainer title="Add Approved Study">
	<svelte:fragment slot="content">
		<div class="approved_study_add">
			<AddApprovedStudy />
		</div>
	</svelte:fragment>
</PageContainer>

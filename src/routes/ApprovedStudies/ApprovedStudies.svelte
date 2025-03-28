<script>
	import PageContainer from '@components/PageContainer/PageContainer.svelte';
    import ApprovedStudies from '@appComponents/ApprovedStudies/ApprovedStudies.svelte';
</script>

<PageContainer title="Approved Studies">
	<svelte:fragment slot="content">
				<div class="approved_studies">
					<ApprovedStudies />
				</div>
	</svelte:fragment>
</PageContainer>

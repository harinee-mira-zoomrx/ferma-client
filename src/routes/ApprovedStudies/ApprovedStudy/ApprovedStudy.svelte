<script>
	import PageContainer from '@components/PageContainer/PageContainer.svelte';
	import EditApprovedStudy from '@appComponents/ApprovedStudies/EditApprovedStudy.svelte';

	export let params;
</script>

<PageContainer title="Edit Approved Study">
	<svelte:fragment slot="content">
		<div class="approved_study_edit">
			<EditApprovedStudy id={params.id} />
		</div>
	</svelte:fragment>
</PageContainer>

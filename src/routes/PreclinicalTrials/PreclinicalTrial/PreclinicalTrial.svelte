<script>
	import PageContainer from '@components/PageContainer/PageContainer.svelte';
    import EditPreclinicalStudy from '@appComponents/PreclinicalTrials/EditPreclinicalStudy.svelte';

	export let params;
</script>

<PageContainer title="Edit Preclinical Study">
	<svelte:fragment slot="content">
				<div class="preclinical_trials_edit">
					<EditPreclinicalStudy id={params.id}/>
				</div>
	</svelte:fragment>
</PageContainer>

<style src="./style.scss"></style>

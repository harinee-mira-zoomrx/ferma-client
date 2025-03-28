<script>
	import PageContainer from '@components/PageContainer/PageContainer.svelte';
    import AddPreclinicalStudy from '@appComponents/PreclinicalTrials/AddPreclinicalStudy.svelte';
</script>

<PageContainer title="Add Preclinical Study">
	<svelte:fragment slot="content">
				<div class="preclinical_trials_add">
					<AddPreclinicalStudy />
				</div>
	</svelte:fragment>
</PageContainer>

<style src="./style.scss"></style>

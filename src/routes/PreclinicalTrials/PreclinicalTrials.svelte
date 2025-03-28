<script>
	import PageContainer from '@components/PageContainer/PageContainer.svelte';
    import PreclinicalStudy from '@appComponents/PreclinicalTrials/PreclinicalStudy.svelte';
</script>

<PageContainer title="Preclinical Studies">
	<svelte:fragment slot="content">
				<div class="preclinical_trials">
					<PreclinicalStudy />
				</div>
	</svelte:fragment>
</PageContainer>

<style src="./style.scss"></style>

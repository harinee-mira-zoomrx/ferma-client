<script>
	import PageContainer from '@components/PageContainer/PageContainer.svelte';
	import Readouts from '@appComponents/Readouts/Readouts.svelte';
</script>

<PageContainer title="Readouts">
	<svelte:fragment slot="content">
				<div class="readouts">
					<Readouts/>
				</div>
	</svelte:fragment>
</PageContainer>

<style src="./style.scss"></style>

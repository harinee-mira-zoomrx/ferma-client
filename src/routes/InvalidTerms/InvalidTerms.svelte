<script>
	import PageContainer from '@components/PageContainer/PageContainer.svelte';
	import InvalidTerms from '@appComponents/InvalidTerms/InvalidTerms.svelte';
</script>

<PageContainer title="Invalid Terms">
	<svelte:fragment slot="content">
				<div class="invalid-terms">
					<InvalidTerms/>
				</div>
	</svelte:fragment>
</PageContainer>

<style src="./style.scss"></style>

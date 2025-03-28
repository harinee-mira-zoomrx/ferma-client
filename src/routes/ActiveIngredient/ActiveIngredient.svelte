<script>
	import PageContainer from '@components/PageContainer/PageContainer.svelte';
	import ActiveIngredient from '@appComponents/ActiveIngredients/ActiveIngredient.svelte';
</script>

<PageContainer title="Active Ingredients">
	<svelte:fragment slot="content">
		<ActiveIngredient />
	</svelte:fragment>
</PageContainer>

<style src="./style.scss"></style>

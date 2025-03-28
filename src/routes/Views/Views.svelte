<script>
	import Selectbox from '@components/Selectbox/Selectbox.svelte';
	import PageContainer from '@components/PageContainer/PageContainer.svelte';
    import View from '@appComponents/View/View.svelte';
    import { queryConstructor } from '@utils/utility';
	import { fetchViews } from '@models/views';

    let selectedView;
    let refreshData = 1;

	const viewsLoadOptions = async (viewOptionsFilterText) => {
		let views = [];
		try {
			let queryParam = [
				{
					key: 'name',
					operator: '%%',
					value: viewOptionsFilterText || '',
				},
			];
			views = await fetchViews({
				page: 1,
				size: 50,
				query: queryConstructor(queryParam),
				sort_by: 'name:asc',
			});
		} catch (error) {
			console.warn(error);
		}
		return views.map((view) => ({
			label: view.name,
			value: view.name,
			data: view,
		}));
	};
</script>

<PageContainer title="Views">
	<div slot="header">
		<div class="view__header">
			<Selectbox
				placeholder="Select view"
				label="View Name"
				bind:value={selectedView}
				loadOptions={viewsLoadOptions}
                clearable={true}
				onInput={() => {
					refreshData += 1;
				}}
			/>
		</div>
	</div>
	<svelte:fragment slot="content">
		{#if selectedView}
			{#key refreshData}
				<div class="view">
					<div class="view__content">
						<View view={selectedView}/>
					</div>
				</div>
			{/key}
		{/if}
	</svelte:fragment>
</PageContainer>

<style src="./style.scss"></style>

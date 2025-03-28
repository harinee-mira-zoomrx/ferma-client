<script>
	import Selectbox from '@components/Selectbox/Selectbox.svelte';
	import PageContainer from '@components/PageContainer/PageContainer.svelte';
	import { fetchSelectRootsSynonymsByLabel } from '@models/roots';
	import Sales from '@appComponents/Sales/Sales.svelte';

	let selectedOrganization;
	let selectedBrand;
	let refreshDatatable = 1;

	const refreshData = () => {
		refreshDatatable += 1;
	};
	const fetchBrand = fetchSelectRootsSynonymsByLabel('Brand');
	const fetchBrandData = async (filter) => {
		const brandData = await fetchBrand(filter);
		return [
			{
				value: null,
				label: 'Unidentified Brand',
				data: {
					id: null,
					name: 'Unidentified Brand',
				},
			},
			...brandData,
		];
	};
</script>

<PageContainer title="Sales">
	<div slot="header">
		<div class="sales__header">
			<Selectbox
				label="Organization Name"
				placeholder="Select organization"
				bind:value={selectedOrganization}
				loadOptions={fetchSelectRootsSynonymsByLabel('Organization')}
				onInput={refreshData}
			/>
			<Selectbox
				label="Brand Name"
				placeholder="Select brand"
				bind:value={selectedBrand}
				loadOptions={fetchBrandData}
				clearable={true}
				onInput={refreshData}
			/>
		</div>
	</div>
	<svelte:fragment slot="content">
		{#if selectedOrganization && selectedBrand}
			{#key refreshDatatable}
				<div class="sales">
					<div class="sales__content">
						<Sales
							organization={selectedOrganization.data}
							brand={selectedBrand?.data}
						/>
					</div>
				</div>
			{/key}
		{/if}
	</svelte:fragment>
</PageContainer>

<style src="./style.scss"></style>

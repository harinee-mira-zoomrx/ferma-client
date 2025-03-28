<script>
	import TanStackTable from '@components/TanStackTable/TanStackTable.svelte';
	import TanStackAction from '@components/TanStackTable/TanStackAction.svelte';
	import Link from '@appComponents/CellComponents/Link.svelte';
	import Button from '@components/Button/Button.svelte';
	import { push } from 'svelte-spa-router';
	import { toasts } from '@components/Toast/toasts';
	import { transformSnakeToCapitalized } from '@utils/utility';
	import { fetchPreclinicalStudies, GEOGRAPHIES, STUDY_TYPE } from '@models/studies';
	import { VERIFICATION_STATUS } from '@utils/constants';

	let columns = [
		{
			accessorKey: '_action',
			header: 'Actions',
			enableColumnFilter: false,
			enableSorting: false,
			size: 100,
			meta: {
				renderComponent: {
					component: TanStackAction,
					props: {
						actions: [
							{
								iconName: 'edit',
								title: 'edit',
								handler: (row) => {
									window.open(`#/preclinical-trials/${row.study_id}`, '_blank');
								},
							},
						],
					},
				},
			},
		},
		{
			accessorKey: 'company',
			header: 'Companies',
			enableColumnFilter: true,
			enableSorting: false,
			size: 250,
		},
		{
			accessorKey: 'active_ingredient',
			header: 'Active Ingredient',
			enableColumnFilter: true,
			enableSorting: false,
			size: 250,
		},
		{
			accessorKey: 'drug_combination_regimen',
			header: 'Drug Combination / Regimen​',
			enableColumnFilter: true,
			enableSorting: false,
			size: 250,
		},
		{
			accessorKey: 'drug_class',
			header: 'Drug Class',
			enableColumnFilter: true,
			enableSorting: false,
			size: 250,
		},
		{
			accessorKey: 'target',
			header: 'Target',
			enableColumnFilter: true,
			enableSorting: false,
			size: 250,
		},
		{
			accessorKey: 'indication',
			header: 'Indication',
			enableColumnFilter: true,
			enableSorting: false,
			size: 250,
		},
		{
			accessorKey: 'disease',
			header: 'Disease',
			enableColumnFilter: true,
			enableSorting: false,
			size: 250,
		},
		{
			accessorKey: 'therapy_area',
			header: 'Therapy Area',
			enableColumnFilter: true,
			enableSorting: false,
			size: 250,
		},
		{
			accessorKey: 'development_phase',
			header: 'Development Stage',
			enableColumnFilter: true,
			enableSorting: false,
			size: 250,
		},
		{
			accessorKey: 'study_date',
			header: 'Study Date',
			enableColumnFilter: false,
			enableSorting: false,
			size: 250,
		},
		{
			accessorKey: 'geography',
			header: 'Geography',
			enableColumnFilter: true,
			meta: {
				filterVariant: 'select',
				filterOptions: GEOGRAPHIES,
			},
			size: 250,
		},
		{
			accessorKey: 'source',
			header: 'Sources',
			enableColumnFilter: true,
			meta: {
				renderComponent: {
					component: Link,
					props: {
						getHref: (rowData) => rowData.source,
					},
				},
			},
			size: 250,
		},
		{
			accessorKey: 'verification_status',
			header: 'Verification Status',
			enableColumnFilter: true,
			cell: (cell) => `${transformSnakeToCapitalized(cell.getValue())}`,
			meta: {
				filterVariant: 'select',
				filterOptions: Object.values(VERIFICATION_STATUS).map(
					(status) => {
						return {
							label: transformSnakeToCapitalized(status),
							value: status,
						};
					}
				),
			},
			size: 200,
		},
		{
			accessorKey: 'study_id',
			header: 'Study ID',
			enableColumnFilter: true,
			enableSorting: true,
			size: 250,
		},
	];
	let datasource = {
		getRows: async (params) => {
			try {
				let options = {
					page: params.page,
					size: params.size,
					search: params.searchQuery || '',
					query: params.filterQuery,
					sort_by: params.sortQuery,
				};
				const [studies, hasNext] =
					await fetchPreclinicalStudies(options);
				params.successCallback(studies, hasNext);
			} catch (error) {
				console.warn(error);
				toasts.error(error.message || 'An unexpected error occurred.');
			}
		},
	};
</script>

<div class="datatable">
	<div class="datatable__content">
		<TanStackTable
			{columns}
			{datasource}
			columnPinning={{ left: ['_action'] }}
			sorting={[{ id: 'study_id', desc: true }]}
			enableGlobalFilter={false}
		>
			<div slot="table-actions-right">
				<Button type="secondary" onClick={() => {
                    push('/preclinical-trials/new')
                }}>Add Study</Button>
			</div>
		</TanStackTable>
	</div>
</div>

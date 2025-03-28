<script>
	import { fetchStudiesList } from '@models/studies.js';
	import { toasts } from '@components/Toast/toasts';
	import { VERIFICATION_STATUS } from '@utils/constants.js';
	import { transformSnakeToCapitalized } from '@utils/utility';
	import Alert from '@components/Alert/Alert.svelte';
	import TanStackAction from '@components/TanStackTable/TanStackAction.svelte';
	import TanStackTable from '@components/TanStackTable/TanStackTable.svelte';
	import {
		getRootLinkCellConfig,
		getRootLinkComponentConfig,
	} from '@utils/component-utils';

	let refreshDatatable;
	let columns = [
		{
			header: 'Actions',
			accessorKey: 'ACTION',
			meta: {
				renderComponent: {
					component: TanStackAction,
					props: {
						actions: [
							{
								iconName: 'edit',
								title: 'Edit',
								handler: (rowData) => {
									window.open(
										`#/trials/${rowData.nct_id}`,
										'_blank'
									);
								},
							},
							{
								iconName: 'unfold_more',
								title: 'Toggle Full Data',
								handler: (_, row) => {
									row.toggleFullView();
								},
							},
						],
					},
				},
			},
			size: 80,
		},
		{
			header: 'NCT_ID',
			accessorKey: 'nct_id',
			enableColumnFilter: true,
			enableSorting: true,
			size: 140,
		},
		{
			header: 'Study ID',
			accessorKey: 'study_id',
			enableColumnFilter: true,
			size: 100,
			meta: {
				filter: {
					type: 'number',
				},
			},
		},
		{
			header: 'Acronym',
			accessorKey: 'acronym',
			enableColumnFilter: true,
			size: 200,
		},
		{
			header: 'Indication',
			accessorKey: 'indication',
			enableColumnFilter: true,
			size: 200,
		},
		{
			header: 'Disease',
			accessorKey: 'disease',
			enableColumnFilter: true,
			size: 200,
			meta: { ...getRootLinkComponentConfig() },
			cell: (cell) => getRootLinkCellConfig(cell),
		},
		{
			header: 'Therapy Area',
			accessorKey: 'therapy_area',
			enableColumnFilter: true,
			size: 200,
			meta: { ...getRootLinkComponentConfig() },
			cell: (cell) => getRootLinkCellConfig(cell),
		},
		{
			header: 'Primary Drug',
			accessorKey: 'primary_drug',
			enableColumnFilter: true,
			size: 200,
			meta: { ...getRootLinkComponentConfig() },
			cell: (cell) => getRootLinkCellConfig(cell),
		},
		{
			header: 'Secondary Drug',
			accessorKey: 'secondary_drug',
			enableColumnFilter: true,
			size: 200,
			meta: { ...getRootLinkComponentConfig() },
			cell: (cell) => getRootLinkCellConfig(cell),
		},
		{
			header: 'Comparator Drug',
			accessorKey: 'comparator_drug',
			enableColumnFilter: true,
			size: 200,
			meta: { ...getRootLinkComponentConfig() },
			cell: (cell) => getRootLinkCellConfig(cell),
		},
		{
			header: 'Sponsors',
			accessorKey: 'sponsor',
			enableColumnFilter: true,
			size: 200,
			meta: { ...getRootLinkComponentConfig() },
			cell: (cell) => getRootLinkCellConfig(cell),
		},
		{
			header: 'Collaborators',
			accessorKey: 'collaborator',
			enableColumnFilter: true,
			size: 200,
			meta: { ...getRootLinkComponentConfig() },
			cell: (cell) => getRootLinkCellConfig(cell),
		},
		{
			header: 'Trial Status',
			accessorKey: 'trial_verification_status',
			cell: (cell) => transformSnakeToCapitalized(cell.getValue()),
			enableColumnFilter: true,
			meta: {
				filterVariant: 'select',
				filterOptions: Object.values(VERIFICATION_STATUS).map(
					(status) => ({
						label: transformSnakeToCapitalized(status),
						value: status,
					})
				),
			},
			size: 200,
		},
		{
			header: 'Readout Studies ID',
			accessorKey: 'readout_studies_id',
			enableColumnFilter: true,
			size: 200,
			meta: {
				filter: {
					type: 'number',
				},
			},
		},
		{
			header: 'Readout Status',
			accessorKey: 'readout_verification_status',
			cell: (cell) => transformSnakeToCapitalized(cell.getValue()),
			enableColumnFilter: true,
			meta: {
				filterVariant: 'select',
				filterOptions: Object.values(VERIFICATION_STATUS).map(
					(status) => ({
						label: transformSnakeToCapitalized(status),
						value: status,
					})
				),
			},
			size: 200,
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
				const [studies, hasNext] = await fetchStudiesList(options);
				params.successCallback(studies, hasNext);
			} catch (error) {
				console.warn(error);
				toasts.error(error?.message || 'An unexpected error occurred.');
			}
		},
	};
</script>

<div class="data-reviewer__datatable datatable">
	<div class="datatable__content">
		<TanStackTable
			{columns}
			{datasource}
			columnPinning={{ left: ['ACTION', 'nct_id'] }}
			sorting={[{ id: 'nct_id', desc: false }]}
			enableGlobalFilter={false}
			enableFullView={true}
			configStorageKey="studies_table"
			bind:refreshDatatable
		></TanStackTable>
		<Alert
			severity="info"
			message="Cumulative search across columns not applicable for - Indication, Disease, Therapy Area"
		></Alert>
	</div>
</div>

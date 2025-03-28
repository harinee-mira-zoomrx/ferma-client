<script>
	import { onMount } from 'svelte';
	import { toasts } from '@components/Toast/toasts';
	import { fetchRootLandscape } from '@models/roots';
	import Datatable from '@components/Datatables/Datatable.svelte';
	import { TABLE_COLUMN_CONFIG } from './columnConfig.js';
	import isEmpty from '@utils/is-empty.js';

	export let root;

	let isDatatableLoading = false;
	let data = {};

	onMount(async () => {
		await fetchLandscapeByRootId();
	});

	const fetchLandscapeByRootId = async () => {
		try {
			isDatatableLoading = true;
			data = await fetchRootLandscape(root.id);
			if (data.trials) {
				data.trials = data.trials.map((trial, index) => ({
					...trial,
					id: index + 1,
				}));
			}
		} catch (error) {
			console.warn(error);
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			isDatatableLoading = false;
		}
	};

	const toTitleCase = (str) => {
		if (isEmpty(str)) {
			return str;
		}
		let titleCasedWords = str.split('_').map((word) => {
			return word.charAt(0).toUpperCase() + word.slice(1);
		});
		return titleCasedWords.join(' ');
	};

	const getColumnsForTable = (tableName) =>
		TABLE_COLUMN_CONFIG[tableName] || [];
</script>

<section class="landscape">
	{#if isDatatableLoading}
		Loading...
	{:else}
		{#each Object.entries(data) as [tableName, tableData]}
			{#if tableData.length > 0}
				<div class="landscape__inner">
					<div class="landscape__header">
						{toTitleCase(tableName)}
					</div>
					<div class="landscape__datatable">
						<Datatable
							columns={getColumnsForTable(tableName)}
							data={tableData}
							disableGlobalSearch={true}
							hasNext={false}
							disablePagination={true}
						/>
					</div>
				</div>
			{/if}
		{/each}
	{/if}
</section>

<style src="./style.scss"></style>

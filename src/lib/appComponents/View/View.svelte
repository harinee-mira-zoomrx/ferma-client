<script>
	import Datatable from '@components/Datatables/Datatable.svelte';
	import { toasts } from '@components/Toast/toasts';
	import { queryConstructor } from '@utils/utility';
	import { fetchView, downloadView } from '@models/views';
	import { onMount } from 'svelte';
	import isEmpty from '@utils/is-empty.js';
	import Button from '@components/Button/Button.svelte';

	export let view;
	let hasNext = false;
	let columnSearchQuery = [];
	let isDatatableLoading = false;
	let isCSVDownloading = false;
	let data = [];
	let page = 1;
	let size = 10;
	let sortBy = '';
	let searchTerm = '';

	$: columns =
		view?.data?.columns?.map((column) => ({
			label: toTitleCase(column),
			value: column,
			tableName: column,
			sortable: true,
			searchable: true,
		})) || [];

	onMount(() => {
		fetchViewData();
	});

	const toTitleCase = (str) => {
		if (isEmpty(str)) {
			return str;
		}
		let titleCasedWords = str.split('_').map((word) => {
			return word.charAt(0).toUpperCase() + word.slice(1);
		});
		return titleCasedWords.join(' ');
	};

	const fetchViewData = async (searchTerm = '') => {
		try {
			isDatatableLoading = true;
			let queryParam = [...columnSearchQuery];
			[data, hasNext] = await fetchView(view.value, {
				page,
				size,
				search: searchTerm || '',
				query: queryConstructor(queryParam),
				sort_by: sortBy,
			});
			data = view?.data?.columns?.includes('id')
				? data
				: data.map((record, index) => ({ id: index + 1, ...record }));
		} catch (error) {
			console.warn(error);
			data = [];
			hasNext = false;
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			isDatatableLoading = false;
		}
		return data;
	};

	const onViewSort = async (e) => {
		page = 1;
		sortBy = `${e.detail.columnId}:${e.detail.sortValue === 'ascending' ? 'asc' : 'desc'}`;
		await fetchViewData(searchTerm);
	};

	const onViewfilter = async (e) => {
		page = 1;
		await fetchViewData(searchTerm);
	};

	const onDownload = async (e) => {
		try {
			isCSVDownloading = true;
			let queryParam = [...columnSearchQuery];
			await downloadView(view.value, {
				search: searchTerm || '',
				query: queryConstructor(queryParam),
				sort_by: sortBy,
			});
		} catch (error) {
			console.warn(error)
			toasts.error('Error in downloading data as CSV');
		} finally {
			isCSVDownloading = false;
		}
	};
</script>

<section class="view">
	<div class="view__header">
		View
		<Button type="primary" onClick={onDownload} disabled={isCSVDownloading}>
			{#if isCSVDownloading}
				Downloading...
			{:else}
				Download CSV
			{/if}
		</Button>
	</div>
	<div class="view__datatable">
		<Datatable
			{columns}
			{hasNext}
			{data}
			loading={isDatatableLoading}
			handleSort={onViewSort}
			handlefilter={onViewfilter}
			bind:searchTerm
			bind:columnSearchQuery
			bind:rowsPerPage={size}
			bind:currentPage={page}
			onPageChange={() => fetchViewData(searchTerm)}
			onGlobalSearch={fetchViewData}
		/>
	</div>
</section>

<style src="./style.scss"></style>

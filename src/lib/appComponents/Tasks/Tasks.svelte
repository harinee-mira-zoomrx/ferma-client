<script>
	import Datatable from '@components/Datatables/Datatable.svelte';
	import { queryConstructor } from '@utils/utility';
	import { onMount } from 'svelte';
	import { toasts } from '@components/Toast/toasts';
	import { loader } from '@components/Loader/Loader';
	import {
		fetchAllTasks,
		retryTask,
		TASK_NAME,
		TASK_STATUS,
		ENTITY_TYPE,
	} from '@models/task';
	import isEmpty from '@utils/is-empty';

	let tasks = [];

	const RETRY_STATUS = ['FAILED', 'PARTIALLY_COMPLETED'];
	const NON_RETRYABLE_TASK = 'trial-update';
	let page = 1;
	let size = 10;
	let hasNext = false;
	let searchTerm = '';
	let isDatatableLoading = false;
	let sortBy = 'id:desc';
	let columnSearchQuery = [];
	let columns = [
		{
			label: 'Id',
			value: 'id',
			tableName: 'id',
			sortable: true,
			searchable: true,
		},
		{
			label: 'Name',
			value: 'name',
			tableName: 'name',
			sortable: true,
			searchable: true,
			searchType: 'SELECT',
			searchOptions: TASK_NAME,
		},
		{
			label: 'Entity Name',
			value: 'entity',
			tableName: 'entity',
			sortable: true,
			searchable: true,
			searchType: 'SELECT',
			searchOptions: ENTITY_TYPE,
		},
		{
			label: 'Entity Id',
			value: 'entity_id',
			tableName: 'entity_id',
			sortable: true,
			searchable: true,
		},
		{
			label: 'Details',
			value: 'details',
			tableName: 'details',
			sortable: true,
			searchable: true,
		},
		{
			label: 'Retry count',
			value: 'retry_count',
			tableName: 'retry_count',
			sortable: true,
			searchable: true,
		},
		{
			label: 'Status',
			value: 'status',
			tableName: 'status',
			sortable: true,
			searchable: true,
			searchType: 'SELECT',
			searchOptions: TASK_STATUS,
		},
		{
			label: 'Created At',
			value: 'created_at',
			tableName: 'created_at',
			sortable: true,
			searchable: true,
		},
		{
			label: 'Modified At',
			value: 'modified_at',
			tableName: 'modified_at',
			sortable: true,
			searchable: true,
		},
		{
			label: 'Actions',
			value: 'ACTION',
			actions: [
				{
					iconName: 'refresh',
					handler: async (task) => {
						try {
							loader.show();
							await retryTask(task.id);
							await refreshDatatable();
						} catch (error) {
							toasts.error(
								'Something went wrong. Please try again.'
							);
						} finally {
							loader.hide();
						}
					},
					disableIf: (task) => {
						const isTaskEligible = task.name !== NON_RETRYABLE_TASK;
						const isStatusEligible = RETRY_STATUS.includes(
							task.status
						);
						const isModifiedDateEligible =
							task.status !== 'COMPLETED' &&
							isDateOlderThan(task.modified_at, 2);
						const forceRetry = task.name === 'gpt-request';
						return (
							task.status === 'RETRYING' ||
							!(
								isTaskEligible &&
								(isStatusEligible ||
									isModifiedDateEligible ||
									forceRetry)
							)
						);
					},
				},
			],
		},
	];

	const isDateOlderThan = (dateToCheck, noOfDays) => {
		const currentDate = new Date();
		const twoDaysAgo = new Date();
		twoDaysAgo.setDate(currentDate.getDate() - noOfDays);
		return new Date(dateToCheck) < twoDaysAgo;
	};

	onMount(async () => {
		await fetchTasks();
	});
	const fetchTasks = async (searchTerm = '') => {
		try {
			let queryParam = [...columnSearchQuery];
			isDatatableLoading = true;
			[tasks, hasNext] = await fetchAllTasks({
				page,
				size,
				search: searchTerm || '',
				query: queryConstructor(queryParam),
				sort_by: sortBy,
			});
		} catch (error) {
			console.warn(error);
			tasks = [];
			hasNext = false;
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			isDatatableLoading = false;
		}
		return tasks;
	};
	const onTasksSort = async (e) => {
		const sortDirection =
			e.detail.sortValue === 'ascending' ? 'asc' : 'desc';
		sortBy = `${e.detail.columnId}:${sortDirection}`;
		page = 1;
		await fetchTasks(searchTerm);
	};
	const onTasksFilter = async (e) => {
		page = 1;
		await fetchTasks(searchTerm);
	};
	const refreshDatatable = async () => {
		await fetchTasks(searchTerm);
	};
	const getSort = () => {
		if (!isEmpty(sortBy)) {
			return sortBy.split(':')[0];
		}
		return '';
	};
	const getSortDirection = () => {
		if (!isEmpty(sortBy)) {
			const direction = sortBy.split(':')[1];
			return direction === 'asc' ? 'ascending' : 'descending';
		}
		return '';
	};
</script>

<section>
	<div class="datatable">
		<Datatable
			{columns}
			{hasNext}
			loading={isDatatableLoading}
			data={tasks}
			sort={getSort()}
			sortDirection={getSortDirection()}
			handleSort={onTasksSort}
			handlefilter={onTasksFilter}
			bind:searchTerm
			bind:columnSearchQuery
			bind:rowsPerPage={size}
			bind:currentPage={page}
			onPageChange={() => fetchTasks(searchTerm)}
			onGlobalSearch={fetchTasks}
		></Datatable>
	</div>
</section>

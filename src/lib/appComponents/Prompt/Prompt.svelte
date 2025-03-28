<script>
	import Datatable from '@components/Datatables/Datatable.svelte';
	import { queryConstructor } from '@utils/utility';
	import { onMount } from 'svelte';
	import { toasts } from '@components/Toast/toasts';
	import { createPrompt, fetchAllPrompts } from '@models/prompt';
	import isEmpty from '@utils/is-empty';
	import PromptVersion from './PromptVersion.svelte';
	import Button from '@components/Button/Button.svelte';
	import Modal from '@components/Modal/Modal.svelte';
	import DynamicForm from '@components/DynamicForm/DynamicForm.svelte';
	import { COMPONENT_TYPES } from '@utils/constants';
	import { loader } from '@components/Loader/Loader';

	let prompts = [];
	let page = 1;
	let size = 10;
	let hasNext = false;
	let searchTerm = '';
	let isDatatableLoading = false;
	let sortBy = 'id:desc';
	let columnSearchQuery = [];
	let showPromptVersion = false;
	let promptId = null;
	let promptName = null;
	let showAddModal = false;

	let columns = [
		{
			label: 'Actions',
			value: 'ACTION',
			actions: [
				{
					iconName: 'visibility',
					title: 'view prompt versions',
					handler: (prompt) => {
						showPromptVersion = true;
						promptId = prompt.id;
						promptName = prompt.name;
					},
				},
			],
		},
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
		},
		{
			label: 'Active Version Id',
			value: 'active_version_id',
			tableName: 'active_version_id',
			sortable: true,
			searchable: true,
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
	];

	onMount(async () => {
		await fetchPrompts();
	});
	const fetchPrompts = async (searchTerm = '') => {
		try {
			let queryParam = [...columnSearchQuery];
			isDatatableLoading = true;
			[prompts, hasNext] = await fetchAllPrompts({
				page,
				size,
				search: searchTerm || '',
				query: queryConstructor(queryParam),
				sort_by: sortBy,
			});
		} catch (error) {
			console.warn(error);
			prompts = [];
			hasNext = false;
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			isDatatableLoading = false;
		}
		return prompts;
	};
	const onPromptsSort = async (e) => {
		const sortDirection =
			e.detail.sortValue === 'ascending' ? 'asc' : 'desc';
		sortBy = `${e.detail.columnId}:${sortDirection}`;
		page = 1;
		await fetchPrompts(searchTerm);
	};
	const onPromptsFilter = async (e) => {
		page = 1;
		await fetchPrompts(searchTerm);
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
	const toggleAddModal = () => {
		showAddModal = !showAddModal;
	};
	const togglePromptVersionModal = () => {
		showPromptVersion = !showPromptVersion;
	};
	const config = [
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				label: 'Name',
				name: 'name',
				placeholder: 'Enter name',
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.BUTTON,
			props: [
				{
					buttonType: 'submit',
					type: 'primary',
					name: 'Save',
				},
			],
		},
	];
	const onSubmit = async (e) => {
		try {
			loader.show();
			await createPrompt({ ...e.detail });
			await fetchPrompts();
			toggleAddModal();
		} catch (error) {
			console.error(error);
			toasts.error(error.message);
		} finally {
			loader.hide();
		}
	};
</script>

{#if showPromptVersion}
	<PromptVersion
		{promptName}
		{promptId}
		onClose={async () => {
            togglePromptVersionModal();
			await fetchPrompts();
		}}
	/>
{:else}
	<section>
		<div class="prompt-template__datatable datatable">
			<div class="prompt-template__header">Prompts</div>
			<Datatable
				{columns}
				{hasNext}
				loading={isDatatableLoading}
				data={prompts}
				sort={getSort()}
				sortDirection={getSortDirection()}
				handleSort={onPromptsSort}
				handlefilter={onPromptsFilter}
				bind:searchTerm
				bind:columnSearchQuery
				bind:rowsPerPage={size}
				bind:currentPage={page}
				onPageChange={() => fetchPrompts(searchTerm)}
				onGlobalSearch={fetchPrompts}
			>
				<svelte:fragment slot="header-button">
					<Button type="secondary" onClick={toggleAddModal}
						>Add</Button
					>
				</svelte:fragment>
			</Datatable>
		</div>
	</section>
{/if}
{#if showAddModal}
	<Modal title="Add Prompt" showModal={true} onClose={toggleAddModal}>
		<svelte:fragment slot="content">
			<DynamicForm {config} columns={1} on:submit={onSubmit} />
		</svelte:fragment>
	</Modal>
{/if}

<style lang="scss">
	.prompt-template {
		&__header {
			font-size: 15px;
			font-weight: 400;
			color: #565656;
			text-transform: capitalize;
		}
	}
</style>

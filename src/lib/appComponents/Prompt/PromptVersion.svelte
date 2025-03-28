<script>
	import Datatable from '@components/Datatables/Datatable.svelte';
	import { queryConstructor } from '@utils/utility';
	import { onMount } from 'svelte';
	import { toasts } from '@components/Toast/toasts';
	import {
		createPromptVersion,
		fetchAllPromptsVersion,
		selectPromptVersion,
	} from '@models/prompt';
	import isEmpty from '@utils/is-empty';
	import { loader } from '@components/Loader/Loader';
	import Button from '@components/Button/Button.svelte';
	import Modal from '@components/Modal/Modal.svelte';
	import DynamicForm from '@components/DynamicForm/DynamicForm.svelte';
	import { COMPONENT_TYPES } from '@utils/constants';

	export let promptId = null;
	export let promptName = null;
	export let onClose = () => {};
	let promptVersions = [];
	let page = 1;
	let size = 10;
	let hasNext = false;
	let searchTerm = '';
	let isDatatableLoading = false;
	let sortBy = 'id:desc';
	let columnSearchQuery = [];
	let showAddModal = false;
	let columns = [
		{
			label: 'Actions',
			value: 'ACTION',
			actions: [
				{
					iconName: 'check',
					title: 'select as active version',
					handler: async (promptVersion) => {
						loader.show();
						await selectPromptVersion(promptId, promptVersion.id);
						loader.hide();
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
			label: 'GCP path',
			value: 'path',
			tableName: 'path',
			sortable: true,
			searchable: true,
		},
		{
			label: 'Description',
			value: 'description',
			tableName: 'description',
			sortable: true,
			searchable: true,
		},
		{
			label: 'Config',
			value: 'config',
			tableName: 'config',
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
		await fetchPromptVersions();
	});
	const fetchPromptVersions = async (searchTerm = '') => {
		try {
			let queryParam = [
				{
					key: 'prompt_template_id',
					operator: '==',
					value: promptId,
				},
				...columnSearchQuery,
			];
			isDatatableLoading = true;
			[promptVersions, hasNext] = await fetchAllPromptsVersion({
				page,
				size,
				search: searchTerm || '',
				query: queryConstructor(queryParam),
				sort_by: sortBy,
			});
		} catch (error) {
			console.warn(error);
			promptVersions = [];
			hasNext = false;
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			isDatatableLoading = false;
		}
		return promptVersions;
	};
	const onPromptsSort = async (e) => {
		const sortDirection =
			e.detail.sortValue === 'ascending' ? 'asc' : 'desc';
		sortBy = `${e.detail.columnId}:${sortDirection}`;
		page = 1;
		await fetchPromptVersions(searchTerm);
	};
	const onPromptsFilter = async (e) => {
		page = 1;
		await fetchPromptVersions(searchTerm);
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
			type: COMPONENT_TYPES.INPUT,
			props: {
				label: 'Path',
				name: 'path',
				placeholder: 'Enter path',
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				label: 'Description',
				name: 'description',
				placeholder: 'Enter description',
			},
		},
		{
			type: COMPONENT_TYPES.SELECT_BOX,
			props: {
				name: 'model',
				label: 'Model',
				placeholder: 'Select model',
				items: ['gpt-4o', 'o1-preview'],
				required: true,
				clearFilterTextOnBlur: true,
			},
		},
		{
			type: COMPONENT_TYPES.SELECT_BOX,
			props: {
				name: 'provider',
				label: 'Provider',
				placeholder: 'Select provider',
				items: ['OPEN_AI', 'AZURE_OPEN_AI'],
				required: true,
				clearFilterTextOnBlur: true,
			},
		},
		{
			type: COMPONENT_TYPES.SELECT_BOX,
			props: {
				name: 'project',
				label: 'Project',
				placeholder: 'Select project',
				items: ['REVIEWER', 'CLINICAL_TRIAL', 'READOUT'],
				required: true,
				clearFilterTextOnBlur: true,
			},
		},
		{
			type: COMPONENT_TYPES.SELECT_BOX,
			props: {
				name: 'responseFormat',
				label: 'Response Format',
				placeholder: 'Select response format',
				items: ['text', 'json_object'],
				clearFilterTextOnBlur: true,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				label: 'Temperature',
				type: 'number',
				additionalProps: {
					min: '0',
					max: '2',
					step: '0.1',
				},
				name: 'temperature',
				placeholder: 'Enter temperature',
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'file',
				label: 'Upload Prompt',
				type: 'file',
				additionalProps: {
					accept: '.txt',
					multiple: false,
				},
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
		const data = { ...e.detail };
		const config = {
			model: data.model,
			provider: data.provider,
			project: data.project,
		};
		if (data.temperature) {
			config['temperature'] = +data.temperature;
		}
		if (data.responseFormat) {
			config['responseFormat'] = {
				type: data.responseFormat,
			};
		}
		const body = {
			name: data.name,
			path: data.path,
			prompt_template_id: promptId,
			description: data.description || null,
			config: JSON.stringify(config),
		};
		if (data.file.name) {
			body.file = data.file;
		}

		const formData = new FormData();
		for (let key in body) {
			if (body[key] !== null && body[key] !== undefined) {
				formData.append(key, body[key]);
			}
		}
		try {
			loader.show();
			await createPromptVersion(formData);
			await fetchPromptVersions();
			toggleAddModal();
		} catch (error) {
			console.error(error);
			toasts.error(error.message);
		} finally {
			loader.hide();
		}
	};
</script>

<section>
	<div class="prompt-template-version__datatable datatable">
		<div class="prompt-template-version__header">
			<Button type="primary" onClick={onClose}>Back</Button> &nbsp;
			{promptName}
		</div>

		<Datatable
			{columns}
			{hasNext}
			loading={isDatatableLoading}
			data={promptVersions}
			sort={getSort()}
			sortDirection={getSortDirection()}
			handleSort={onPromptsSort}
			handlefilter={onPromptsFilter}
			bind:searchTerm
			bind:columnSearchQuery
			bind:rowsPerPage={size}
			bind:currentPage={page}
			onPageChange={() => fetchPromptVersions(searchTerm)}
			onGlobalSearch={fetchPromptVersions}
		>
			<svelte:fragment slot="header-button">
				<Button type="secondary" onClick={toggleAddModal}>Add</Button>
			</svelte:fragment>
		</Datatable>
	</div>
</section>
{#if showAddModal}
	<Modal title="Add Prompt Version" showModal={true} onClose={toggleAddModal}>
		<svelte:fragment slot="content">
			<DynamicForm {config} columns={2} on:submit={onSubmit} />
		</svelte:fragment>
	</Modal>
{/if}

<style lang="scss">
	.prompt-template-version {
		&__header {
			display: flex;
			align-items: center;
			justify-content: flex-start;
			gap: 10px;
			margin-bottom: 10px;

			font-size: 15px;
			font-weight: 400;
			color: #565656;
			text-transform: capitalize;
		}
		&__datatable {
			&--hidden {
				display: none;
			}
		}
	}
</style>

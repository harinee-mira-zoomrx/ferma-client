<script>
	import Button from '@components/Button/Button.svelte';
	import DeleteModal from '@components/Modal/DeleteModal/DeleteModal.svelte';
	import isEmpty from '@utils/is-empty.js';
	import { onMount } from 'svelte';
	import { STUDY_DESIGN_HEADERS } from '@models/readoutsSections.js';
	import Textarea from '@components/Textarea/Textarea.svelte';
	import Textbox from '@components/Textbox/Textbox.svelte';
	import DiffModal from '@components/DynamicForm/DiffModal/DiffModal.svelte';
	import { toasts } from '@components/Toast/toasts.js';
	import IconButton from '@smui/icon-button';

	export let data = {};
	export let editState = false;
	export let onSectionSave = (e) => {};

	const SECTION_TYPES = {
		CONTENT: 'section_content',
		SUMMARY: 'section_summary',
	};

	let showEditedModal = false;
	let showDeleteModal = false;
	let sectionToDelete = null;
	let contextSectionConfigs = [];
	let summarySectionConfigs = [];
	let originalData = JSON.parse(JSON.stringify(data));
	let updatedData = {};
	let editedData = [];

	const initializeData = () => {
		if (!isEmpty(data)) {
			contextSectionConfigs = initializeSectionConfigs(
				STUDY_DESIGN_HEADERS.CONTENT,
				SECTION_TYPES.CONTENT
			);
			summarySectionConfigs = initializeSectionConfigs(
				STUDY_DESIGN_HEADERS.SUMMARY,
				SECTION_TYPES.SUMMARY
			);
		}
	};

	const initializeSectionConfigs = (headers, sectionType) => {
		return headers.map((name) => {
			const value = data[sectionType]?.[name.toLowerCase()] || '';
			return {
				name,
				value,
				action: value ? 'Remove' : 'Add',
				buttonType: value ? 'cautious-secondary' : 'secondary',
				isTextareaVisible: !!value,
			};
		});
	};

	initializeData();

	const toggleButtonState = (configs, index, sectionType) => {
		const sectionData = configs[index];
		const key = sectionData.name.toLowerCase();

		sectionData.isTextareaVisible = !sectionData.isTextareaVisible;
		sectionData.action = sectionData.isTextareaVisible ? 'Remove' : 'Add';
		sectionData.buttonType = sectionData.isTextareaVisible
			? 'cautious-secondary'
			: 'secondary';

		if (!sectionData.isTextareaVisible) {
			data[sectionType][key] = '';
			sectionData.value = '';
		}

		data[sectionType] = { ...data[sectionType] };

		if (sectionType === SECTION_TYPES.CONTENT) {
			contextSectionConfigs = [...configs];
		} else {
			summarySectionConfigs = [...configs];
		}
	};

	const togglePicker = (configs, index, sectionType) => {
		const sectionData = configs[index];

		if (sectionData.action === 'Remove') {
			sectionToDelete = { configs, index, sectionType };
			showDeleteModal = true;
		} else {
			toggleButtonState(configs, index, sectionType);
		}
	};

	const confirmDelete = () => {
		const { configs, index, sectionType } = sectionToDelete;
		toggleButtonState(configs, index, sectionType);
		sectionToDelete = null;
		showDeleteModal = false;
	};

	const onDiscard = () => {
		editState = false;
		data = JSON.parse(JSON.stringify(originalData));
		initializeData();
	};

	const onSubmit = () => {
		editedData = [];
		updatedData = {};
		const removeId = ({ id, ...rest }) => rest;

		if (JSON.stringify(data) === JSON.stringify(originalData)) {
			toasts.warn('No changes to update.');
			return;
		}
		editedData.push({
			label: 'Study Design',
			original: removeId(originalData),
			edited: removeId(data),
			showDiff: true,
		});
		updatedData.study_design = data;

		showEditedModal = true;
	};

	const confirmSubmit = () => {
		showEditedModal = false;

		onSectionSave({
			sectionType: 'study_design',
			updatedData: updatedData,
		});
	};
</script>

<div class="section-header">
	<span>Study Design</span>

	{#if !editState}
		<IconButton
			class="material-icons"
			ripple={false}
			on:click={() => {
				editState = !editState;
			}}
		>
			edit
		</IconButton>
	{/if}
</div>

{#if data}
	{#each [{ title: 'Content', configs: contextSectionConfigs, sectionType: SECTION_TYPES.CONTENT }, { title: 'Summary', configs: summarySectionConfigs, sectionType: SECTION_TYPES.SUMMARY }] as section}
		<div class="study-design-layout">
			<p class="study-design-layout__header">{section.title}</p>
			<div class="study-design-layout__content">
				{#if editState}
					<div class="button-section">
						{#each section.configs as sectionData, index (sectionData.name)}
							<Button
								type={sectionData.buttonType}
								onClick={() =>
									togglePicker(
										section.configs,
										index,
										section.sectionType
									)}
							>
								{sectionData.action}
								{sectionData.name}
							</Button>
						{/each}
					</div>
				{/if}

				<div class="textarea-section">
					{#if editState}
						{#each section.configs as sectionData}
							{#if sectionData.isTextareaVisible}
								<Textarea
									value={sectionData.value}
									placeholder={`Enter ${sectionData.name} value`}
									label={sectionData.name}
									name={sectionData.name.toLowerCase()}
									required={true}
									width="100%"
									onInput={(e) => {
										data[section.sectionType][
											sectionData.name?.toLowerCase()
										] = e.target.textContent;
										sectionData.value =
											e.target.textContent;
									}}
								/>
							{/if}
						{/each}
					{:else}
						{#each section.configs as sectionData}
							{#if sectionData.isTextareaVisible}
								<Textbox
									value={sectionData.value}
									label={sectionData.name}
									name={sectionData.name.toLowerCase()}
									width="100%"
								/>
							{/if}
						{/each}
					{/if}
				</div>
			</div>
		</div>
	{/each}
{/if}

{#if showDeleteModal}
	<DeleteModal
		entityName="item from study design"
		onClose={() => (showDeleteModal = false)}
		on:delete={confirmDelete}
	/>
{/if}

{#if editState}
	<div class="action-buttons">
		<Button type="secondary" onClick={onDiscard}>Discard</Button>
		<Button type="primary" onClick={onSubmit}>Save</Button>
	</div>
{/if}

{#if showEditedModal}
	<DiffModal
		onClose={() => {
			showEditedModal = false;
			editState = true;
		}}
		{editedData}
		onSubmit={confirmSubmit}
	/>
{/if}

<style src="./style.scss"></style>

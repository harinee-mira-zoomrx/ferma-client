<script>
	import Button from '@components/Button/Button.svelte';
	import DeleteModal from '@components/Modal/DeleteModal/DeleteModal.svelte';
	import IconButton from '@smui/icon-button';
	import { READOUTS_SECTION_TYPE } from '@models/readoutsSections.js';
	import Textarea from '@components/Textarea/Textarea.svelte';
	import Textbox from '@components/Textbox/Textbox.svelte';
	import DiffModal from '@components/DynamicForm/DiffModal/DiffModal.svelte';
	import { toasts } from '@components/Toast/toasts.js';
	import isEmpty from '@utils/is-empty.js';

	export let header = '';
	export let data = {};
	export let editState = false;
	export let onSectionSave = (e) => {};

	let showEditedModal = false;
	let showDeleteModal = false;
	let deleteIndex = null;
	let originalData = JSON.parse(JSON.stringify(data));
	let updatedData = {};
	let editedData = [];

	const addToSectionContext = () => {
		data.section_content = [
			...data.section_content,
			header === READOUTS_SECTION_TYPE.EFFICACY
				? { parameter: '', endpoint_type: '', context: '' }
				: { parameter: '', context: '' },
		];
	};

	const removeSectionContext = () => {
		if (deleteIndex !== null) {
			data.section_content[deleteIndex] = {};
			deleteIndex = null;
		}
		toggleDeleteModal();
	};

	const toggleDeleteModal = () => {
		showDeleteModal = !showDeleteModal;
	};

	const handleDelete = (index) => {
		deleteIndex = index;
		showDeleteModal = true;
	};

	const onDiscard = () => {
		editState = false;
		data = JSON.parse(JSON.stringify(originalData));
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
			label: header,
			original: removeId(originalData),
			edited: removeId(data),
			showDiff: true,
		});
		updatedData[header.toLowerCase()] = data;

		showEditedModal = true;
	};

	const confirmSubmit = () => {
		showEditedModal = false;

		onSectionSave({
			sectionType: header.toLowerCase(),
			updatedData: updatedData,
		});
	};
</script>

<div class="section-header">
	<span>{header.toLowerCase()} Results</span>

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
	<div class="advanced-context">
		<div class="advanced-context-layout">
			<p class="advanced-context-layout__header">Content</p>

			{#if editState}
				<div class="advanced-context-layout__content">
					{#each data?.section_content || [] as sectionContent, index}
						{#if !isEmpty(sectionContent)}
							<div class="advanced-context-layout__item_header">
								<div>{`Entry ${index + 1}:`}</div>
								<div
									class="advanced-context-layout__delete_icon"
								>
									<IconButton
										class="material-icons"
										ripple={false}
										on:click={() => handleDelete(index)}
									>
										close
									</IconButton>
								</div>
							</div>
							<div class="advanced-context-layout__item">
								<Textarea
									value={sectionContent?.parameter}
									placeholder="Enter Parameter"
									label="Parameter"
									name="parameter"
									width="100%"
									onInput={(e) =>
										(sectionContent.parameter =
											e.target.textContent)}
								/>
								{#if header !== READOUTS_SECTION_TYPE.SAFETY}
									<Textarea
										value={sectionContent?.endpoint_type}
										placeholder="Enter Endpoint Type"
										label="Endpoint Type"
										name="endpoint_type"
										width="100%"
										onInput={(e) =>
											(sectionContent.endpoint_type =
												e.target.textContent)}
									/>
								{/if}
								<Textarea
									value={sectionContent?.context}
									placeholder="Enter Context"
									label="Context"
									name="context"
									width="100%"
									onInput={(e) =>
										(sectionContent.context =
											e.target.textContent)}
								/>
							</div>
						{/if}
					{/each}
				</div>
				<div class="advanced-context-layout__add">
					<Button type="secondary" onClick={addToSectionContext}>
						Add
					</Button>
				</div>
			{:else}
				<div class="advanced-context-layout__content">
					{#each data?.section_content || [] as sectionContent, index}
						<div class="advanced-context-layout__item_header">
							<div>{`Entry ${index + 1}:`}</div>
						</div>
						<div class="advanced-context-layout__item">
							<Textbox
								value={sectionContent?.parameter}
								label="Parameter"
								name="parameter"
								width="100%"
							/>
							{#if header !== READOUTS_SECTION_TYPE.SAFETY}
								<Textbox
									value={sectionContent?.endpoint_type}
									label="Endpoint Type"
									name="endpoint_type"
									width="100%"
								/>
							{/if}
							<Textbox
								value={sectionContent?.context}
								label="Context"
								name="context"
								width="100%"
							/>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<p class="advanced-context-layout__header">Summary</p>
		{#if editState}
			<Textarea
				value={data?.section_summary?.summary}
				placeholder="Enter Summary"
				name="summary"
				width="100%"
				onInput={(e) => {
					if (!data.section_summary) {
						data.section_summary = {};
					}
					data.section_summary['summary'] = e.target.textContent;
				}}
			/>
		{:else}
			<Textbox
				value={data?.section_summary?.summary}
				name="summary"
				width="100%"
			/>
		{/if}
	</div>
{/if}

{#if showDeleteModal}
	<DeleteModal
		entityName={`item from ${header}`}
		onClose={toggleDeleteModal}
		on:delete={removeSectionContext}
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

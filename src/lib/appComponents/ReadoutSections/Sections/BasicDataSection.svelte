<script>
	import DynamicForm from '@components/DynamicForm/DynamicForm.svelte';
	import { COMPONENT_TYPES } from '@utils/constants.js';
	import IconButton from '@smui/icon-button';
	import Button from '@components/Button/Button.svelte';
	import { toasts } from '@components/Toast/toasts.js';
	import DiffModal from '@components/DynamicForm/DiffModal/DiffModal.svelte';

	export let header = '';
	export let data = {};
	export let editState = false;
	export let onSectionSave = (e) => {};

	let showEditedModal = false;
	let originalData = JSON.parse(JSON.stringify(data));
	let updatedData = {};
	let editedData = [];

	$: config = [
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				label: 'Content',
				name: 'content',
				placeholder: 'Enter context',
				width: '100%',
				value: data?.section_content?.content,
				disabled: !editState,
				isEditable: editState,
				onInput: (e) => {
					if (!data.section_content) {
						data.section_content = {};
					}
					data.section_content['content'] = e.target.textContent;
				},
			},
		},
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				label: 'Summary',
				name: 'summary',
				placeholder: 'Enter summary',
				width: '100%',
				value: data?.section_summary?.summary,
				disabled: !editState,
				isEditable: editState,
				onInput: (e) => {
					if (!data.section_summary) {
						data.section_summary = {};
					}
					data.section_summary['summary'] = e.target.textContent;
				},
			},
		},
	];

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
	<span>{header.toLowerCase()}</span>

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
	<div class="form">
		<DynamicForm {config} columns={4} fullWidth={true} />
	</div>
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

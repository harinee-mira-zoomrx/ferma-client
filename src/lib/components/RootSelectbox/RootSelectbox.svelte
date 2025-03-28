<script>
	import Selectbox from '@components/Selectbox/Selectbox.svelte';
	import NewRootModal from '@appComponents/NewRootModal/NewRootModal.svelte';
	import { checkRootName } from '@models/roots.js';
	import { toasts } from '@components/Toast/toasts.js';
	import { createEventDispatcher, tick } from 'svelte';
	import { rootSynonymItemFilter } from '@utils/component-utils';

	export let items = [];
	export let value = undefined;
	export let listOpen = false;
	export let onSelect = (e) => {};
	export let onInput = (e) => {};
	export let onChange = (e) => {};
	export let onClear = () => {};
	export let label = null;
	export let clearable = false;
	export let placeholder = '';
	export let disabled = false;
	export let loadOptions = null;
	export let filterText = '';
	export let name = null;
	export let clearFilterTextOnBlur = false;
	export let required = false;
	export let multiple = false;
	export let itemId = 'value';
	export let createLabelType = null;
	export let itemFilter = rootSynonymItemFilter;
	export let allowCreate = false;
	export let width = '300px';
	export let onAddNewRoot = (e) => {
		const newRoot = e.detail;
		const eventDetail = {
			additionalLabel: null,
			data: { ...newRoot },
			id: newRoot.id,
			label: newRoot.name,
			value: newRoot.id,
		};
		if (multiple) {
			value = [
				...value.filter((v) => !(v.isCreateOption === true)),
				eventDetail,
			];
		} else {
			value = { ...eventDetail };
		}
	};

	let showAddRootModal = false;
	let rootData = {};

	const dispatch = createEventDispatcher();

	const onCreateHandler = async (e) => {
		if (!e?.detail) {
			return;
		}

		try {
			await checkRootName({ name: e.detail?.createRootName });
			rootData = { ...e.detail, createLabelType: createLabelType };
			showAddRootModal = true;
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
			if (multiple) {
				value = [...value.filter((v) => !(v.isCreateOption === true))];
			} else {
				onClearHandler();
			}
		}

		if (!clearFilterTextOnBlur && !multiple) {
			filterText = value?.label || '';
		}
	};

	const onSelectHandler = async (e) => {
		onSelect(e);
		if (!clearFilterTextOnBlur && !multiple) {
			filterText = value?.label || '';
		}
	};

	const onClearHandler = () => {
		value = undefined;
		filterText = '';
		listOpen = false;
		dispatch('clear', value);
	};

	const onCloseNewRootModal = () => {
		showAddRootModal = false;
		rootData = {};
		if (multiple) {
			value = [...value.filter((v) => !(v.isCreateOption === true))];
		} else {
			value = undefined;
		}
		filterText = '';
	};

	const onAddNewRootHandler = async (e) => {
		await onAddNewRoot(e);
		await tick();
		filterText = '';
		showAddRootModal = false;
		rootData = {};
	};
</script>

<Selectbox
	{allowCreate}
	bind:items
	{label}
	{clearable}
	{placeholder}
	{disabled}
	{loadOptions}
	{filterText}
	{clearFilterTextOnBlur}
	{name}
	{required}
	{multiple}
	{itemId}
	{width}
	{itemFilter}
	onSelect={onSelectHandler}
	onCreate={onCreateHandler}
	{onInput}
	{onChange}
	{onClear}
	bind:listOpen
	bind:value
/>

{#if showAddRootModal}
	<NewRootModal
		{rootData}
		{showAddRootModal}
		onClose={onCloseNewRootModal}
		on:add={onAddNewRootHandler}
	/>
{/if}

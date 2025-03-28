<script>
	import Alert from '@components/Alert/Alert.svelte';
	import Button from '@components/Button/Button.svelte';
	import Input from '@components/Input/Input.svelte';
	import SegmentPill from '@components/SegmentPill/SegmentPill.svelte';
	import Selectbox from '@components/Selectbox/Selectbox.svelte';
	import RootSelectbox from '@components/RootSelectbox/RootSelectbox.svelte';
	import Textarea from '@components/Textarea/Textarea.svelte';
	import Textbox from '@components/Textbox/Textbox.svelte';
	import LinkList from '@components/LinkList/LinkList.svelte';
	import { toasts } from '@components/Toast/toasts';
	import { COMPONENT_TYPES } from '@utils/constants';
	import { sortByAsc } from '@utils/utility';
	import { createEventDispatcher } from 'svelte';
	import DiffModal from './DiffModal/DiffModal.svelte';
	import Toggle from '@appComponents/Toggle/Toggle.svelte';
	import RootSelectPill from '@appComponents/RootSelectPill/RootSelectPill.svelte';
	export let config = [];
	export let columns = 1;
	export let fullWidth = false;
	export let formElement = null;
	export let showEditedValues = false;

	let editedData = [];
	let data = {};
	let showEditedModal = false;
	const dispatch = createEventDispatcher();
	const convertFormDataToObject = (e) => {
		const formData = new FormData(e.target);
		const data = {};
		for (let field of formData) {
			let [key, value] = field;
			data[key] = value;
		}
		return data;
	};

	const processFormValue = (data, column, field = 'value') => {
		const key = column?.props?.name;
		let value = data[key];
		// To get value from svelte select and segment pill
		if (
			[
				COMPONENT_TYPES.SEGMENT_PILL,
				COMPONENT_TYPES.SELECT_BOX,
				COMPONENT_TYPES.ROOT_SELECT_BOX,
				COMPONENT_TYPES.ROOT_SELECT_PILL,
			].includes(column.type)
		) {
			try {
				let val = JSON.parse(value);
				if (
					[
						COMPONENT_TYPES.SELECT_BOX,
						COMPONENT_TYPES.ROOT_SELECT_BOX,
						COMPONENT_TYPES.ROOT_SELECT_PILL,
					].includes(column.type) &&
					column?.props?.multiple === true
				) {
					value =
						val
							?.sort((a, b) => sortByAsc(a, b, 'value'))
							?.map((val) => val[field]) || [];
					value = [...new Set(value)];
				} else {
					// To accept textbox value (selectbox disabled state)
					value = val[field] !== undefined ? val[field] : val;
				}
			} catch {}
		}
		if (value === '') {
			value = column?.default !== undefined ? column?.default : null;
		}
		return value;
	};

	const processOriginalValue = (column, field = 'value') => {
		let originalValue = column?.props?.value;
		if (originalValue && typeof originalValue === 'object') {
			if (
				[
					COMPONENT_TYPES.SELECT_BOX,
					COMPONENT_TYPES.ROOT_SELECT_BOX,
					COMPONENT_TYPES.ROOT_SELECT_PILL,
				].includes(column.type) &&
				column?.props?.multiple === true
			) {
				originalValue =
					originalValue
						?.sort((a, b) => sortByAsc(a, b, 'value'))
						.map((val) => val[field]) || [];
				originalValue = [...new Set(originalValue)];
			} else {
				originalValue = originalValue?.[field];
			}
		}
		return originalValue;
	};

	const isSameDate = (column, formValue, originalValue) => {
		return (
			column?.type === COMPONENT_TYPES.INPUT &&
			['date', 'datetime-local'].includes(column?.props?.type) &&
			new Date(originalValue).getTime() === new Date(formValue).getTime()
		);
	};

	const onSubmit = (e) => {
		data = convertFormDataToObject(e);
		let tempData = { ...data };
		editedData = [];
		for (const column of config) {
			const key = column?.props?.name;
			if (!key || column.hide) continue;

			data[key] = processFormValue(data, column);
			let originalValue = processOriginalValue(column);
			if (
				!column?.props?.disabled &&
				!column.preserveUnchangedData &&
				(String(originalValue) === String(data[key]) ||
					isSameDate(column, data[key], originalValue))
			) {
				delete data[key];
				continue;
			}
			if (
				typeof column.validation === 'function' &&
				data[key] &&
				!(!column?.props?.required && data[key] === null) &&
				!column.validation(data[key])
			) {
				return;
			}
			if (showEditedValues) {
				editedData.push({
					edited: processFormValue(tempData, column, 'label'),
					original: processOriginalValue(column, 'label'),
					label: column?.props?.label,
					showDiff:
						[
							COMPONENT_TYPES.TEXTAREA,
							COMPONENT_TYPES.INPUT,
						].includes(column.type) &&
						!['date', 'datetime-local'].includes(
							column?.props?.type
						),
				});
			}
		}
		if (!Object.values(data).length) {
			toasts.warn('No changes to update.');
			return;
		}
		if (showEditedValues) {
			showEditedModal = true;
		} else {
			dispatch('submit', data);
		}
	};
</script>

<form
	on:submit|preventDefault={onSubmit}
	class="form"
	class:form--full={fullWidth}
	bind:this={formElement}
	style="width: {columns * 300 + (columns - 1) * 30}px;"
>
	{#each config as element}
		{#if element?.hide !== true}
			<div
				class="form__element"
				class:form__btn-container={element.type ===
					COMPONENT_TYPES.BUTTON}
				class:form__alert-container={element.type ===
					COMPONENT_TYPES.ALERT}
			>
				{#if element?.props?.disabled || element.type === COMPONENT_TYPES.TEXTBOX}
					<Textbox
						label={element?.props?.label}
						value={element?.props?.value?.label ||
							element?.props?.value}
						inputValue={element?.props?.value?.value !== undefined
							? element?.props?.value?.value
							: element?.props?.value}
						width={element?.props?.width}
						name={element?.props?.name}
					/>
				{:else}
					{#if element.type === COMPONENT_TYPES.SELECT_BOX}
						<Selectbox
							clearable={!element.props.required}
							{...element.props}
						/>
					{/if}
					{#if element.type === COMPONENT_TYPES.ROOT_SELECT_BOX}
						<RootSelectbox
							clearable={!element.props.required}
							{...element.props}
						/>
					{/if}
					{#if element.type === COMPONENT_TYPES.ROOT_SELECT_PILL}
						<RootSelectPill {...element.props} />
					{/if}
					{#if element.type === COMPONENT_TYPES.INPUT}
						<Input {...element.props} />
					{/if}
					{#if element.type === COMPONENT_TYPES.TEXTAREA}
						<Textarea {...element.props} />
					{/if}
					{#if element.type === COMPONENT_TYPES.SEGMENT_PILL}
						<SegmentPill {...element.props} />
					{/if}
					{#if element.type === COMPONENT_TYPES.ALERT}
						<Alert {...element.props} />
					{/if}
					{#if element.type === COMPONENT_TYPES.TOGGLE}
						<Toggle {...element.props} />
					{/if}
					{#if element.type === COMPONENT_TYPES.LINK_LIST}
						<LinkList {...element.props} />
					{/if}
				{/if}
				{#if element.type === COMPONENT_TYPES.BUTTON}
					{#each element.props as prop}
						<div class="form__btn">
							<Button {...prop}>
								{prop.name}
							</Button>
						</div>
					{/each}
				{/if}
			</div>
		{/if}
	{/each}
</form>
{#if showEditedModal}
	<DiffModal
		onClose={() => {
			showEditedModal = false;
		}}
		{editedData}
		onSubmit={() => {
			dispatch('submit', data);
		}}
	/>
{/if}

<style src="./style.scss"></style>

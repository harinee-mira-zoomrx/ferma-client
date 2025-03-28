<script>
	import CircularLoader from '@components/CircularLoader/index.svelte';
	import Select from 'svelte-select';
	import { createEventDispatcher, onDestroy } from 'svelte';

	export let items = [];
	export let value = undefined;
	export let listOpen = false;
	export let onSelect = (e) => {};
	export let onCreate = (e) => {};
	export let onClear = () => {};
	export let onInput = (e) => {};
	export let onChange = (e) => {};
	export let label = null;
	export let clearable = false;
	export let showChevron = true;
	export let placeholder = '';
	export let disabled = false;
	export let loadOptions = null;
	export let filterText = '';
	export let floatingConfig = { strategy: 'fixed' };
	export let name = null;
	export let required = false;
	export let groupBy = null;
	export let loading = false;
	export let clearFilterTextOnBlur = false;
	export let multiple = false;
	export let itemId = 'value';
	export let debounceWait = 500;
	export let width = '300px';
	export let itemFilter = (label, filterText, option) =>
		label.toLowerCase().includes(filterText.toLowerCase());
	export let allowCreate = false;

	let debounceTimeout;
	let noResults = false;

	const dispatch = createEventDispatcher();

	$: if (filterText) {
		loading = false;
		onInputHandler();
	}

	$: if (
		listOpen &&
		!items.length &&
		!loading &&
		filterText === '' &&
		!noResults
	) {
		loading = false;
		onInputHandler();
	}

	onDestroy(() => {
		clearTimeout(debounceTimeout);
	});

	const convertStringItemsToObjects = (items) => {
		return items.map((item) => ({ label: item, value: item }));
	};

	async function getItems() {
		if (!loadOptions || (value && value?.isCreateOption)) {
			return;
		}
		let res = await loadOptions(filterText).catch((err) => {
			console.warn('svelte-select loadOptions error :>> ', err);
			dispatch('error', { type: 'loadOptions', details: err });
		});
		if (
			!multiple &&
			res.length &&
			value?.label &&
			res[0]?.label &&
			!res.find((item) => (item?.label || item) === value.label)
		) {
			res.unshift(value);
		}

		if (res && !res.cancelled) {
			if (res) {
				if (res && res.length > 0 && typeof res[0] !== 'object') {
					res = convertStringItemsToObjects(res);
				}
			} else {
				res = [];
			}
			items = res;

			noResults = res.length === 0;

			return {
				filteredItems: res,
				loading: false,
				focused: true,
				listOpen: true,
			};
		}
	}
	function filter({
		filterText,
		items,
		multiple,
		value,
		itemId,
		groupBy,
		filterSelectedItems,
		itemFilter,
		convertStringItemsToObjects,
		filterGroupedItems,
		label,
	}) {
		if (!items) return [];

		if (items && items.length > 0 && typeof items[0] !== 'object') {
			items = convertStringItemsToObjects(items);
		}

		let filterResults = items.filter((item) => {
			let matchesFilter = itemFilter(item[label], filterText, item);
			if (matchesFilter && multiple && value?.length) {
				matchesFilter = !value.some((x) => {
					return filterSelectedItems
						? x[itemId] === item[itemId]
						: false;
				});
			}

			return matchesFilter;
		});

		if (allowCreate) {
			const hasExactMatchCheck = filterResults.some(
				(entry) =>
					entry.label.toLowerCase() === filterText.toLowerCase()
			);
			if (!hasExactMatchCheck && filterText) {
				filterResults.unshift({
					label: `Create "${filterText}"`,
					value: 'create-option',
					isCreateOption: true,
					createRootName: filterText,
				});
			}
		}

		if (groupBy) {
			filterResults = filterGroupedItems(filterResults);
		}

		return filterResults;
	}

	let props = {};
	const onSelectHandler = async (e) => {
		if (e.detail?.isCreateOption) {
			onCreate(e);
			return;
		}
		onSelect(e);
		if (!clearFilterTextOnBlur && !multiple) {
			filterText = value?.label || '';
		}
	};
	const onBlurHandler = async () => {
		if (!clearFilterTextOnBlur && !multiple) {
			filterText = value?.label || '';
			listOpen = false;
		} else if (multiple) {
			filterText = value?.label || '';
		}
	};
	const onClearHandler = () => {
		onClear();
		filterText = '';
	};
	const onOpenHandler = async () => {
		if (!items.length && !loading) {
			loading = true;
			await getItems();
			loading = false;
		}
	};
	const onInputHandler = (e) => {
		if (filterText === value?.label) return;
		if (e) {
			onInput(e);
		} else {
			clearTimeout(debounceTimeout);
			debounceTimeout = setTimeout(async () => {
				if (!loading) {
					loading = true;
					await getItems();
					listOpen = true;
					loading = false;
				}
			}, debounceWait);
		}
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="select-box"
	on:click|stopPropagation
	class:multiple
	style="--width: {width};"
>
	{#if label}
		<div class="select-box__label">
			{label}
			{#if required}
				<span class="select-box__label--mandatory">*</span>
			{/if}
		</div>
	{/if}
	<div class="select-box__inner">
		<Select
			{clearFilterTextOnBlur}
			{items}
			{clearable}
			{showChevron}
			{placeholder}
			{disabled}
			{floatingConfig}
			{name}
			{groupBy}
			{required}
			{...props}
			{multiple}
			{itemId}
			{debounceWait}
			closeListOnChange={!multiple}
			{getItems}
			{filter}
			{itemFilter}
			bind:filterText
			bind:loading
			on:input={onInputHandler}
			on:select={onSelectHandler}
			on:blur={onBlurHandler}
			on:clear={onClearHandler}
			on:open={onOpenHandler}
			on:change={onChange}
			bind:listOpen
			bind:value
		>
			<div slot="item" class="item" let:item>
				{item.label}
				{#if item.additionalLabel}
					<div class="label__additional-info">
						{item.additionalLabel}
					</div>
				{/if}
			</div>
			<div slot="empty" class="empty">
				{#if loading}
					<CircularLoader />
				{:else}
					No options.
				{/if}
			</div>
		</Select>
	</div>
</div>

<style src="./style.scss"></style>

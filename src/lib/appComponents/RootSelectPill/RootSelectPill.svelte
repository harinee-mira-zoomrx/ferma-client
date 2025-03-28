<script>
	import RootSelectbox from '@components/RootSelectbox/RootSelectbox.svelte';
	import { fetchSelectRootsSynonymsByLabel } from '@models/roots';
	import { tick } from 'svelte';
	import { clickOutside } from '@utils/clickOutside';
	import Link from '@appComponents/CellComponents/Link.svelte';
	export let value;
	export let label = '';
	export let rootLabel = '';
	export let name = '';
	export let disabled = false;
	export let allowCreate = false;
	export let required = false;
	export let showRemove = true;
	export let width = 'unset';
	export let onSelect = null;
	export let multiple = false;
	export let enableBackLinks = true;
	$: uniqueValueLabels = new Set(
		Array.isArray(value) ? value?.map((item) => item.label) : value?.label
	);
	let selectValue;
	let filterText;
	let options;
	let showAddSelectbox = false;
	$: formattedOptions =
		options?.filter((option) => !uniqueValueLabels.has(option.label)) ?? [];
	const onSelectHandler = async (e) => {
		await insertValue(e, e?.detail);
	};
	const onAddRootHandler = async (e) => {
		const newRoot = e.detail;
		const eventDetail = {
			additionalLabel: null,
			data: { ...newRoot },
			id: newRoot.id,
			label: newRoot.name,
			value: newRoot.id,
		};
		await insertValue(e, eventDetail);
	};
	const insertValue = async (e, val) => {
		if (multiple) {
			value = [...(value || []), val];
			await tick();
		} else {
			value = { ...val };
			await tick();
			toggleAddSelectbox(e);
		}
		selectValue = null;
		filterText = '';
		if (onSelect && typeof onSelect === 'function') {
			// @ts-ignore
			await onSelect(e, value);
		}
	};
	const handleDelete = async (e, item) => {
		if (multiple) {
			value = value.filter((val) => val.label !== item.label);
		} else {
			value = null;
		}
		if (onSelect && typeof onSelect === 'function') {
			// @ts-ignore
			await onSelect(e, value);
		}
	};
	const rootOptionsGetter = fetchSelectRootsSynonymsByLabel(rootLabel);
	const toggleAddSelectbox = (e) => {
		if (disabled) return;
		e?.stopPropagation();
		showAddSelectbox = !showAddSelectbox;
	};
	$: pillItems = value ? (Array.isArray(value) ? value : [value]) : [];
</script>

<div class="multi-select-pills">
	{#if label}
		<div class="multi-select-pills__label">
			{label}
			{#if required}
				<span class="multi-select-pills__label--mandatory">*</span>
			{/if}
		</div>
	{/if}
	<div class="pill" class:pill--hidden={!pillItems.length}>
		{#each pillItems as item (item.label)}
			<div class="pill__item-container">
				<span class="pill__item">
					{#if enableBackLinks}
						<Link
							href={`#/roots/${item.value}`}
							data={item.label}
						/>
					{:else}
						{item.label}
					{/if}
				</span>
				{#if showRemove}
					<div
						class="pill__remove"
						role="button"
						tabindex="0"
						on:click={(e) => handleDelete(e, item)}
						on:keydown={(e) => handleDelete(e, item)}
					>
						<svg
							width="11"
							height="11"
							viewBox="0 0 40 40"
							focusable="false"
							aria-hidden="true"
						>
							<path
								fill="currentColor"
								d="M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124
                l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z"
							>
							</path>
						</svg>
					</div>
				{/if}
			</div>
		{/each}
	</div>
	<div class="pill__add">
		<div class="required">
			{#if required && (multiple ? !value?.length : !value)}
				<select required tabindex="-1"></select>
			{:else}
				<input
					type="hidden"
					value={JSON.stringify(value || [])}
					{name}
					{required}
				/>
			{/if}
		</div>

		<div
			class="pill__add-btn"
			class:pill__add-btn--disabled={disabled}
			role="button"
			tabindex="0"
			on:keydown|stopPropagation={toggleAddSelectbox}
			on:click|stopPropagation={toggleAddSelectbox}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="15"
				height="15"
				viewBox="0 0 24 24"
				fill="none"
			>
				<g id="style=linear">
					<g id="add-box">
						<path
							id="vector"
							d="M2 8C2 4.68629 4.68629 2 8 2H16C19.3137 2 22 4.68629 22 8V16C22 19.3137 19.3137 22 16 22H8C4.68629 22 2 19.3137 2 16V8Z"
							stroke="#000000"
							stroke-width="1.5"
						/>
						<path
							id="vector_2"
							d="M12 7.75732L12 16.2426"
							stroke="#000000"
							stroke-width="1.5"
							stroke-linecap="round"
						/>
						<path
							id="vector_3"
							d="M16.25 12L7.76476 12"
							stroke="#000000"
							stroke-width="1.5"
							stroke-linecap="round"
						/>
					</g>
				</g>
			</svg>
			{multiple || (!multiple && !value) ? 'Add' : 'Edit'}
		</div>

		{#if showAddSelectbox}
			<div use:clickOutside={toggleAddSelectbox}>
				<RootSelectbox
					bind:items={formattedOptions}
					bind:value={selectValue}
					bind:filterText
					placeholder={'Select ' + label.toLowerCase()}
					loadOptions={async (val) => {
						options = await rootOptionsGetter(val);
						return options.filter(
							(item) => !uniqueValueLabels.has(item.label)
						);
					}}
					createLabelType={rootLabel}
					{allowCreate}
					{disabled}
					{required}
					{width}
					onSelect={onSelectHandler}
					onAddNewRoot={onAddRootHandler}
				/>
			</div>
		{/if}
	</div>
</div>

<style src="./style.scss"></style>

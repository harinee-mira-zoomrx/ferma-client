<script>
	import { Icon } from '@smui/icon-button';
	import Tooltip from '@components/Tooltip/Tooltip.svelte';

	export let items = [];
	export let value;
	export let label = null;
	export let required = null;
	export let name;
	export let disabled = false;
	export let infoMessage = null;
	export let onClickHandler = (option, e) => {
		value = option;
	};

	$: if (!value) {
		value = items[0];
	}
	$: if (items.length > 0) {
		items = items.map((item) => {
			if (typeof item === 'string') {
				return {
					value: item,
					label: item,
				};
			}
			return item;
		});
	}
	$: if (typeof value === 'string') {
		value = {
			value: value,
			label: value,
		};
	}

	const onClick =  (option, e) => {
		value = option;
		onClickHandler(option);
	};
</script>

<div class="segment">
	{#if label}
		<div class="segment__label">
			{label}
			{#if required}
				<div class="segment__label--mandatory">*</div>
			{/if}
			{#if infoMessage}
				<Tooltip title={infoMessage} class="segment__label--tooltip">
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						class="segment__label--tooltip"
						on:click|stopPropagation
					>
						<Icon
						class="material-icons mdc-icon-button mdc-icon-button--display-flex">
							info
						</Icon>
					</div>
				</Tooltip>
			{/if}
		</div>
	{/if}
	<div class="segment__container">
		<div class="segment__inner">
			{#each items as option (option?.label)}
				<button
					class="pill"
					class:pill--active={option?.value === value?.value}
					on:click|stopPropagation|preventDefault={(e) =>
						onClick(option, e)}
					{disabled}
				>
					{option?.label}
				</button>
			{/each}
		</div>
		<input
			class="hidden"
			{required}
			{disabled}
			{name}
			value={JSON.stringify(value)}
		/>
	</div>
</div>

<style lang="scss" src="./style.scss"></style>

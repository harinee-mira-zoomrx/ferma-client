<script>
	import { onMount } from 'svelte';

	export let placeholder = null;
	export let disabled = false;
	export let value = '';
	export let label = null;
	export let onBlur = () => {};
	export let onInput = (e) => {};
	export let name = null;
	export let required = false;
	export let additionalProps = {};
	export let width = null;
	export let isEditable = true;
	let textarea;
	onMount(() => {
		if (width) {
			textarea.style.width = width;
		}
	});
	function handleInput(e) {
		textareaInput = e.target.textContent;
		onInput(e);
	}
	$: textareaInput = value;
</script>

<div class="input" bind:this={textarea}>
	{#if label}
		<div class="input__label">
			{label}
			{#if required}
				<span class="input__label--mandatory">*</span>
			{/if}
		</div>
	{/if}
	<div class="input__inner">
		{#if disabled}
			<div class="input__content input__content--disabled" role="textbox">
				{value || ''}
			</div>
		{:else}
			<div
				class={`input__content ${isEditable ? 'editable' : ''}`}
				{placeholder}
				contenteditable="true"
				role="textbox"
				on:input={handleInput}
				on:blur={onBlur}
			>
				{value || ''}
			</div>
		{/if}

		<input
			class="hidden"
			{required}
			{disabled}
			{name}
			{...additionalProps}
			bind:value={textareaInput}
		/>
	</div>
</div>

<style lang="scss">
	.hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
		z-index: -1;
		left: 50%;
	}
	.input {
		display: flex;
		align-self: flex-start;
		flex-direction: column;
		width: 300px;
		min-width: 300px;

		&__label {
			display: flex;
			align-self: flex-start;
			justify-content: flex-start;
			font-size: 12px;
			color: #8b8b8b;

			&--mandatory {
				color: #e74d4d;
				margin-left: 2px;
			}
		}
	}
	.input__inner {
		position: relative;
	}
	.input__content {
		outline: none;
		min-height: 36px;
		background: #fff;
		border: var(--textarea-border, 0);
		color: #454545;
		padding-left: 16px;
		border-radius: 6px;
		padding: 6px 10px 6px 16px;

		&--disabled {
			cursor: not-allowed;
		}
	}
	[placeholder]:empty::before {
		content: attr(placeholder);
		color: #8e9295;
		font-weight: 500;
	}

	[placeholder]:empty:focus::before {
		content: '';
	}

	.editable {
      --textarea-border: 1px solid #d8dbdf;
	}
</style>

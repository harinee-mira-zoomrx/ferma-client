<script>
	export let placeholder = null;
	export let disabled = false;
	export let value = '';
	export let label = null;
	export let onBlur = () => {};
	export let onInput = (e) => {};
	export let type = 'text';
	export let name = null;
	export let required = false;
	export let additionalProps = {};
	export let readonly = null;
	const handleInput = (e) => {
		value = type.match(/^(number|range)$/)
			? +e.target.value
			: e.target.value;
		onInput(e);
	};
</script>

<div class="input">
	{#if label}
		<div class="input__label">
			{label}
			{#if required}
				<span class="input__label--mandatory">*</span>
			{/if}
		</div>
	{/if}
	<input
		class="input__content"
		class:empty={type !== 'text' && !value}
		{type}
		{disabled}
		{placeholder}
		{value}
		{required}
		{name}
		{readonly}
		{...additionalProps}
		on:input={handleInput}
		on:blur={onBlur}
		on:click|stopPropagation
	/>
</div>

<style lang="scss">
	.input {
		display: flex;
		align-self: flex-start;
		flex-direction: column;

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
	.input__content {
		outline: none;
		width: 300px;
		height: 36px;
		background: #fff;
		border: 1px solid #d8dbdf;
		color: #454545;
		padding-left: 16px;
		padding-right: 10px;
		border-radius: var(--input-border-radius, 6px);
		font-size: 14px;

		&::placeholder {
			color: #8e9295;
			opacity: 1;
		}

		&::-ms-input-placeholder {
			color: #8e9295;
		}
	}
	.empty {
		color: #8e9295;
	}
</style>

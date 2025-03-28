<script>
	export let value;
	export let onChange = () => {};
	export let name = 'toggle';
	export let label = null;
	export let required = false;
</script>

<section class="toggle">
	{#if label}
		<div class="toggle__label">
			{label}
			{#if required}
				<span class="toggle__label--mandatory">*</span>
			{/if}
		</div>
	{/if}
	<label class="toggle-switch">
		<input type="checkbox" {value} {name} on:change={onChange} />
		<div class="toggle-switch-background">
			<div class="toggle-switch-handle"></div>
		</div>
	</label>
</section>

<style lang="scss">
	.toggle {
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
	.toggle-switch {
		position: relative;
		display: inline-block;
		width: 50px;
		height: 28px;
		cursor: pointer;
	}

	.toggle-switch input[type='checkbox'] {
		display: none;
	}

	.toggle-switch-background {
		width: 100%;
		height: 100%;
		background-color: #f3f4f6;
		border-radius: 999px;
		transition: background-color 0.3s ease-in-out;
	}

	.toggle-switch-handle {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 24px;
		height: 24px;
		box-shadow: 0px 1px 2px 0px #0000001a;
		background-color: #fff;
		border-radius: 50%;
		transition: transform 0.3s ease-in-out;
	}

	.toggle-switch input[type='checkbox']:checked + .toggle-switch-handle {
		transform: translateX(22px);
	}

	.toggle-switch input[type='checkbox']:checked + .toggle-switch-background {
		background-color: #2563eb;
	}

	.toggle-switch
		input[type='checkbox']:checked
		+ .toggle-switch-background
		.toggle-switch-handle {
		transform: translateX(22px);
	}
</style>

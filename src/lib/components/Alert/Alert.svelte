<script>
	import { Icon } from '@smui/icon-button';

	export let severity = "info";
	export let message = "";
	export let checkBoxMessage = '';
	export let value = false;
	export let name;
	export let onBlur = () => {};
	export let onInput = (e) => {};

	const iconColours = {
		'info': '#2196f3',
		'success': '#4caf50',
		'warning': '#ff9800',
		'red': '#f44336'
	}

	const handleInput = (e) => {
		value = e.target.checked;
		onInput(e);
	};
</script>

<div class="alert {severity}">
	<div class="alert-message">
		<Icon
			class="material-icons"
			style="font-size: 18px; color: {iconColours[severity]}"
		>
			{#if severity === 'info'}info{/if}
			{#if severity === 'success'}check_circle{/if}
			{#if severity === 'warning'}warning{/if}
			{#if severity === 'error'}error{/if}
		</Icon>
		<div>{message}</div>
	</div>
	{#if checkBoxMessage}
		<div class="alert-check-box-message">
			<input
				type="checkbox"
				{value}
				required={true}
				{name}
				on:input={handleInput}
				on:blur={onBlur}
				on:click|stopPropagation
			/>
			<div>{checkBoxMessage}</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.alert {
		display: flex;
		padding: 10px;
		border-radius: 5px;
		font-size: 12px;
		color: #535353;
		border: none;
		width: 100%;
		flex-direction: column;
		row-gap: 3px;

		&.info {
			background-color: #e5f5fd;
		}

		&.success {
			background-color: #edf7ed;
		}

		&.warning {
			background-color: #fff3e5;
		}

		&.error {
			background-color: #fcedec;
		}

		&-message {
			display: flex;
			column-gap: 8px;
			justify-content: center;
		}

		&-check-box-message {
			display: flex;
			column-gap: 8px;
			justify-content: center;
		}
	}
</style>

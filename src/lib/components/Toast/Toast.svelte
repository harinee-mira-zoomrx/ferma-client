<script>
	import { toasts } from './toasts.js';
	import { fade, fly } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import IconButton from '@smui/icon-button';
</script>

<div class="toast-wrapper">
	{#each $toasts as toast (toast._id)}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="toast"
			class:toast--error={toast.type === 'error'}
			class:toast--warn={toast.type === 'warn'}
			class:toast--info={toast.type === 'info'}
			class:toast--success={toast.type === 'success'}
			in:fly={{
				delay: 0,
				duration: 100,
				x: 0,
				y: 50,
				easing: backOut,
			}}
			out:fade={{ duration: 500 }}
		>
			<div class="toast__message">{toast.msg}</div>
			{#if !(toast.type === 'info' || toast.type === 'success')}
				<IconButton
					class="material-icons toast__close"
					ripple={false}
					on:click={() => {
						toasts.closeToast(toast._id);
					}}
				>
					close
				</IconButton>
			{/if}
		</div>
	{/each}
</div>

<style src="./style.scss">
</style>

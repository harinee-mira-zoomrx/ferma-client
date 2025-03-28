import { writable } from 'svelte/store';

export const toasts = createToast();

export let pushToast = toasts.pushToast;

function createToast() {
	const { subscribe, update } = writable([]);

	let toastId = 0;

	function pushToast(msg = '', type = 'info', retainMs = 6000) {
		const id = ++toastId;
		update((existingToasts) => [
			// ...existingToasts,
			{
				_id: id,
				msg,
				type,
			},
		]);
		setTimeout(() => {
			closeToast(id);
		}, retainMs);
	}

	function closeToast(id) {
		update((existingToasts) =>
			existingToasts.filter((toast) => toast._id != id)
		);
	}

	function warn(msg = '', retainMs = 10000) {
		pushToast(msg, 'warn', retainMs);
	}
	function success(msg = '', retainMs = 3000) {
		pushToast(msg, 'success', retainMs);
	}
	function error(msg = '', retainMs = 10000) {
		pushToast(msg, 'error', retainMs);
	}
	function info(msg = '', retainMs = 3000) {
		pushToast(msg, 'info', retainMs);
	}

	return {
		subscribe,
		pushToast,
		closeToast,
		warn,
		success,
		error,
		info,
	};
}

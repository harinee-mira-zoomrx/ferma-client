import { writable } from 'svelte/store';

export const loader = createLoader();

function createLoader() {
	const { subscribe, set } = writable(false);

	const show = () => {
		set(true);
	}
	const hide = () => {
		set(false)
	}
	return {
		subscribe,
		show,
		hide,
	};
}

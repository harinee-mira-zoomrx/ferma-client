import { writable } from 'svelte/store';
import {
	getLocalStorageItem,
	setLocalStorageItem,
	removeLocalStorageItem,
} from '../utils/local-storage';

export default function createPersistantStore(key, defaultValue = null) {
	const { subscribe, set } = writable(
		getLocalStorageItem(key) ?? defaultValue
	);

	return {
		subscribe,
		set: (value) => {
			setLocalStorageItem(key, value);
			set(value);
		},
		remove: () => {
			removeLocalStorageItem(key);
			set(null);
		},
	};
}

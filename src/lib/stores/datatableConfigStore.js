import { writable } from 'svelte/store';
import {
	setLocalStorageItem,
} from '../utils/local-storage';

function getLocalStorageItem(key) {
	const value = localStorage.getItem(key);
	try {
		return JSON.parse(value) || {};
	} catch (error) {
		console.error('Error parsing localStorage item', key, error);
		return {};
	}
}

export default function createDatatableStore(datatableKey, defaultConfig = {}) {
	if (!datatableKey) {
		// Return a dummy store with no-op functions if key is empty
		const { subscribe, set } = writable(defaultConfig);
		return {
			subscribe,
			set: () => {},
			updateTable: () => {},
			reset: () => set(defaultConfig),
			remove: () => set(defaultConfig),
		};
	}

	const storageKey = 'datatable_configs_v2';
	const storedConfigs = getLocalStorageItem(storageKey);
	const initialConfig = storedConfigs[datatableKey] || defaultConfig;

	const { subscribe, set, update } = writable(initialConfig);

	function saveConfig(newConfig) {
		storedConfigs[datatableKey] = newConfig;
		setLocalStorageItem(storageKey, storedConfigs);
	}

	return {
		subscribe,
		set: (newConfig) => {
			saveConfig(newConfig);
			set(newConfig);
		},
		updateTable: (newConfig) => {
			saveConfig(newConfig);
			update(() => newConfig);
		},
		reset: () => {
			saveConfig(defaultConfig);
			set(defaultConfig);
		},
		remove: () => {
			delete storedConfigs[datatableKey];
			setLocalStorageItem(storageKey, storedConfigs);
			set(defaultConfig);
		},
	};
}

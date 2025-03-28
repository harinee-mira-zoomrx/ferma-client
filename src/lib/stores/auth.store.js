import createPersistantStore from './createPersistantStore.js';
import { writable } from 'svelte/store';

const KEYS = {
	TOKEN: 'authToken',
	USER: 'userDetails',
	LOGOUT: 'isLogout'
};

export const token = createPersistantStore(KEYS.TOKEN);
export const is_logout = createPersistantStore(KEYS.LOGOUT);

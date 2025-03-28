import { Authorizer } from 'casbin.js';
import { token } from '@stores/auth.store';
import { get } from 'svelte/store';
import createPersistantStore from './createPersistantStore.js';
import { logout } from '@models/user';



function createAuthorizationStore() {
	const DEFAULT = {
		authorizer: null,
		permissions: {
			canMergeRoot: false,
			canInvalidateRoot: false,
			canChangeRootLabel: false,
		},
	};
	const { subscribe, set, remove } = createPersistantStore('authorization', { ...DEFAULT });
	let authorizer = null;

	const initAuthorization = async (role) => {
		try {
		authorizer = new Authorizer('auto', {
			endpoint: `${import.meta.env.VITE_API_URL}/users/permissions`,

			requestHeaders: {
				// @ts-ignore
				Authorization: 'Bearer ' + get(token)?.idToken,
			},
		});
			await authorizer.setUser(role);
		} catch (error) {
			await logout();
			return
		}

		const canMergeRoot = await authorizer.can('merge', 'roots');
		const canChangeRootLabel = await authorizer.can(
			'update_label',
			'roots'
		);
		const canInvalidateRoot = await authorizer.can('invalidate', 'roots');

		set({
			authorizer,
			permissions: {
				canMergeRoot,
				canChangeRootLabel,
				canInvalidateRoot,
			},
		});
	};

	const clearAuthorization = () => {
		remove();
	};

	return {
		subscribe,
		initAuthorization,
		clearAuthorization,
	};
}

export const authorization = createAuthorizationStore();

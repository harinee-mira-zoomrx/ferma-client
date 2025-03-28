import { get } from 'svelte/store';
import { push } from 'svelte-spa-router';
import { token, is_logout } from '../stores/auth.store';
import { authorization } from '@stores/authorization.store';
import { loader } from '@components/Loader/Loader';
import {
	setLocalStorageItem,
	removeLocalStorageItem,
	getLocalStorageItem,
} from '../utils/local-storage';
import { get as apiGet } from '../utils/api';
import { msal_auth } from '../utils/msal.js';
import { createSingletonPromiseExecutor } from '@utils/utility';
import isEmpty from '@utils/is-empty';

const login = createSingletonPromiseExecutor(async () => {
	try {
		await msal_auth.authenticate();

		const { responseData } = await apiGet('/users/get_user_details');
		setLocalStorageItem('userDetails', responseData);

		is_logout.remove();
		const userDetails = getLocalStorageItem('userDetails');
		if (userDetails?.roles?.length > 0) {
			await authorization.initAuthorization(userDetails['roles'][0]);
		} else {
			throw new Error(
				'User details or roles are missing. Authorization cannot be initialized.'
			);
		}
	} catch (error) {
		console.error('Error handling redirect: ', error);
		await logout();
		throw error;
	}
});

const logout = createSingletonPromiseExecutor(async () => {
	try {
		loader.show();
		token.remove();
		removeLocalStorageItem('userDetails');
		sessionStorage.clear();
		is_logout.set('true');
		authorization.clearAuthorization();
		push('/login');
	} finally {
		loader.hide();
	}
});

const isAuthorized = () =>
	!isEmpty(get(token)) && !isEmpty(get(authorization)?.authorizer);

export { login, logout, isAuthorized };

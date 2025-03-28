import isEmpty from '@utils/is-empty.js';
import { token } from '../stores/auth.store';
import { get as getStore } from 'svelte/store';
import downloadFileUsingBlob from './downloadFileUsingBlob';
import {
	getLocalStorageItem,
} from '../utils/local-storage';

import { logout } from '@models/user';
import { msal_auth } from '@utils/msal';

export const SERVER_ERROR_CODE = {
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	INVALID_METHOD: 405,
	CONFLICT: 409,
	INVALID_ENTITY: 422,
	SERVER_ERROR: 500,
	BAD_GATEWAY: 502,
	MAINTENANCE: 503,
	'NOT_ACCEPTED_T&C': 511,
};

export const UNDER_MAINTENANCE_CODE = [
	SERVER_ERROR_CODE['BAD_GATEWAY'],
	SERVER_ERROR_CODE['MAINTENANCE'],
];

const fetch_retry = async (url, options, retryCount = 1) => {
	let response = await fetch(url, options);
	if (response.status === SERVER_ERROR_CODE['UNAUTHORIZED'] && retryCount) {
		try {
			options.headers = await setBearer(options.headers);
			return fetch_retry(url, options, 0);
		} catch (refreshError) {
			console.error(refreshError);
		}
	}
	return response;
};

export const get = async (
	url = '',
	params = {},
	headers = {},
	exception = {}
) => {
	if (!isEmpty(params)) {
		url = url + '?' + new URLSearchParams(params).toString();
	}
	headers = await setBearer(headers);
	// @ts-ignore
	const response = await fetch_retry(import.meta.env.VITE_API_URL + url, {
		headers: {
			'Content-Type': 'application/json',
			...headers,
		},
		referrerPolicy: 'origin',
	});

	return await responseHandler(response, exception);
};

export const post = async (
	url = '',
	data = null,
	headers = {},
	options = {}
) => {
	headers = await setBearer(headers);
	// @ts-ignore
	const response = await fetch_retry(import.meta.env.VITE_API_URL + url, {
		method: 'POST',
		headers: {
			...(!options.noContentType && {
				'Content-Type': 'application/json',
			}),
			...headers,
		},
		referrerPolicy: 'origin',
		signal: options.signal,
		body: options.noFormat ? data : JSON.stringify(data),
	});

	return await responseHandler(response);
};

export const put = async (
	url = '',
	data = null,
	headers = {},
	options = {}
) => {
	headers = await setBearer(headers);
	// @ts-ignore
	const response = await fetch_retry(import.meta.env.VITE_API_URL + url, {
		method: 'PUT',
		headers: {
			...(!options.noContentType && {
				'Content-Type': 'application/json',
			}),
			...headers,
		},
		referrerPolicy: 'no-referrer',
		body: options.noFormat ? data : JSON.stringify(data),
		signal: options.signal,
	});

	return await responseHandler(response);
};

export const patch = async (
	url = '',
	data = null,
	headers = {},
	options = {}
) => {
	headers = await setBearer(headers);
	// @ts-ignore
	const response = await fetch_retry(import.meta.env.VITE_API_URL + url, {
		method: 'PATCH',
		headers: {
			...(!options.noContentType && {
				'Content-Type': 'application/json',
			}),
			...headers,
		},
		referrerPolicy: 'no-referrer',
		body: options.noFormat ? data : JSON.stringify(data),
		signal: options.signal,
	});

	return await responseHandler(response);
};

export const destroy = async (url = '', headers = {}) => {
	headers = await setBearer(headers);
	// @ts-ignore
	const response = await fetch_retry(import.meta.env.VITE_API_URL + url, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			...headers,
		},
		referrerPolicy: 'no-referrer',
	});

	return await responseHandler(response);
};

async function responseHandler(response, exception = {}) {
	const isJson = response.headers
		.get('content-type')
		?.includes('application/json');
	const isCsv = response.headers
		.get('content-type')
		?.includes('text/csv');
	const isXlsx = response.headers
		.get('content-type')
		?.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
	let responseData = null;
	if (isJson) {
		responseData = await response.json();
	} else if (isCsv) {
		const contentDisposition = response.headers.get('Content-Disposition');

		const filename = contentDisposition
			? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
			: 'result.csv';
		const blob = await response.blob();
		downloadFileUsingBlob(blob, filename);
		responseData = {
			data: 'CSV download successful'
		}
	} else if (isXlsx) {
		const contentDisposition = response.headers.get('Content-Disposition');

		const filename = contentDisposition
			? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
			: 'result.csv';
		const blob = await response.blob();
		downloadFileUsingBlob(blob, filename);
		responseData = {
			data: 'Xlsx download successful'
		}
	}

	if (!response.ok) {
		let error = 'Something went wrong. Please contact the development team.';
		if (response.status === SERVER_ERROR_CODE['FORBIDDEN'])
		{
			await logout();
			error = "User not part of the system. Please contact the development team"
			return Promise.reject({ message: error, status: response.status });

		}
		else if (response.status === SERVER_ERROR_CODE['UNAUTHORIZED']) {
			await logout();
			error = "Your session was expired. Please try again."
			return Promise.reject({ message: error, status: response.status });
		}
		// if (
		// 	UNDER_MAINTENANCE_CODE.includes(response.status) &&
		// 	!exception.noMaintenance
		// ) {
		// 	underMaintenance.set(true);
		// }
		
		if (responseData && typeof responseData.detail === 'string') {
			error = responseData.detail;
		} else if (responseData?.detail?.[0]?.msg) {
			error = `Invalid ${responseData?.detail[0]?.loc[1]} - ${responseData?.detail?.[0]?.msg}`;
		}
		return Promise.reject({ message: error, status: response.status });
	}
	// getStore(underMaintenance) && underMaintenance.set(false);
	return Promise.resolve({ responseData, response });
}

async function setBearer(headers) {

	if (getStore(token)?.idToken) {
		const idToken = await msal_auth.getIdToken();
		headers = {
			...headers,
			Authorization: 'Bearer ' + idToken
		};
	}
	return headers;
}


export const downloadFile = async (
	url = '',
	params = {},
	headers = {},
	exception = {}
) => {
	if (!isEmpty(params)) {
		url = url + '?' + new URLSearchParams(params).toString();
	}
	headers = await setBearer(headers);

	// @ts-ignore
	const response = await fetch_retry(import.meta.env.VITE_API_URL + url, {
		headers: {
			'Content-Type': 'application/json',
			...headers,
		},
		referrerPolicy: 'origin',
	});

	const contentDisposition = response.headers.get('Content-Disposition');
	let fileName = params.file_name || 'downloaded_file';
	if (contentDisposition) {
		const match = contentDisposition.match(/filename="(.+)"/);
		if (match && match.length === 2) {
			fileName = match.pop();
		}
	}

	const blob = await response.blob();
	downloadFileUsingBlob(blob, fileName);
}
import { destroy, get, patch, post } from '../utils/api';

export async function fetchPendingActions(id) {
	const { responseData } = await get(`/pending_actions/roots/${id}`);
	return responseData?.data || {};
}

export async function createPendingAction(body) {
	const { responseData } = await post(`/pending_actions/roots`, body);
	return responseData?.data || {};
}

export async function deletePendingAction(id) {
	const { responseData } = await destroy(`/pending_actions/${id}`);
	return responseData?.data || {};
}

export async function approvePendingAction(id) {
	const { responseData } = await post(`/pending_actions/roots/approve/${id}`);
	return responseData?.data || {};
}

export const PENDING_ACTIONS_ENTITY = {
	ROOTS: 'ROOTS',
};

export const PENDING_ACTIONS = {
	MERGE: 'MERGE',
	INVALID: 'INVALID',
	LABEL_CHANGE: 'LABEL_CHANGE',
};

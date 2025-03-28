import { destroy, get, patch, post } from '../utils/api';

export async function fetchTrials(queryParams) {
	const { responseData } = await get(`/trials?${new URLSearchParams(queryParams).toString()}`);
	return responseData?.data || [];
}

export async function fetchTrial(id, queryParams) {
	const { responseData } = await get(`/trials/${id}?${new URLSearchParams(queryParams).toString()}`);
	return responseData || {};
}

export async function createTrials(body) {
	const { responseData } = await post('/trials', body);
	return responseData?.data || {};
}

export async function updateTrials(id, body) {
	const { responseData } = await patch('/trials/' + id, body);
	return responseData?.data || {};
}

export async function deleteTrials(id) {
	const { responseData } = await destroy('/trials/' + id);
	return responseData?.data || {};
}

export const TRIAL_PHASES = {
	EARLY_PHASE_1: 'Early Phase 1',
	PHASE_1: 'Phase 1',
	PHASE_1_2: 'Phase 1 / Phase 2',
	PHASE_2: 'Phase 2',
	PHASE_2_3: 'Phase 2 / Phase 3',
	PHASE_3: 'Phase 3',
	PHASE_4: 'Phase 4',
}

export const TRIAL_STATUS = {
	COMPLETED: 'Completed',
	ACTIVE_NOT_RECRUITING: 'Active, not recruiting',
	RECRUITING: 'Recruiting',
	NOT_YET_RECRUITING: 'Not yet recruiting',
	ENROLLED_BY_INVITATION: 'Enrolling by invitation',
	SUSPENDED: 'Suspended',
	TERMINATED: 'Terminated',
	WITHDRAWN: 'Withdrawn',
	AVAILABLE: 'Available',
	NO_LONGER_AVAILABLE: 'No longer available',
	TEMPORARILY_NOT_AVAILABLE: 'Temporarily not available',
	APPROVED_FOR_MARKETING: 'Approved for marketing',
	WITHHELD: 'Withheld',
	UNKNOWN_STATUS: 'Unknown status',
}
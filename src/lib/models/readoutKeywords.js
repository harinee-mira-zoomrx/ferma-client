
import { destroy, get, patch, post } from '../utils/api';

export async function fetchReadoutKeywords(queryParams) {
	const { responseData } = await get(
		`/readouts_keywords?${new URLSearchParams(queryParams).toString()}`
	);
	return [responseData?.data || [], responseData.has_next, responseData?.meta || {}];
}

export async function updateReadoutKeywords(id, body) {
	const { responseData } = await patch('/readouts_keywords/' + id, body);
	return responseData?.data || {};
}

export async function deleteReadoutKeyword(id) {
	const { responseData } = await destroy('/readouts_keywords/' + id);
	return responseData?.data || {};
}

export async function createReadoutKeyword(body) {
	const { responseData } = await post('/readouts_keywords', body);
	return responseData?.data || {};
}

export async function updateReadoutKeywordsVerificationStatus(readoutId, body) {
	const { responseData } = await patch(`/readouts_keywords/verification_status/${readoutId}`, body);
	return responseData?.data || {};
}

export const READOUT_KEYWORDS_LABEL = {
    TRIAL_IDENTIFIER: 'TRIAL_IDENTIFIER',
    TRIAL_ACRONYM: 'TRIAL_ACRONYM',
    INDICATION: 'INDICATION',
    DISEASE: 'DISEASE',
    PHASE: 'PHASE',
    SPONSOR: 'SPONSOR',
    PRIMARY_DRUG: 'PRIMARY_DRUG',
    SECONDARY_DRUG: 'SECONDARY_DRUG',
    COMPARATOR_DRUG: 'COMPARATOR_DRUG',
}
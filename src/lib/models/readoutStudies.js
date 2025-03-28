
import { destroy, get, patch, post } from '../utils/api';

export async function fetchReadoutStudies(queryParams) {
	const { responseData } = await get(
		`/readouts_studies?${new URLSearchParams(queryParams).toString()}`
	);
	return [responseData?.data || [], responseData.has_next, responseData?.meta || {}];
}

export async function updateReadoutStudies(id, body) {
	const { responseData } = await patch('/readouts_studies/' + id, body);
	return responseData?.data || {};
}

export async function deleteReadoutStudies(id) {
	const { responseData } = await destroy('/readouts_studies/' + id);
	return responseData?.data || {};
}

export async function createReadoutStudy(body) {
	const { responseData } = await post('/readouts_studies', body);
	return responseData?.data || {};
}

export async function updateReadoutStudiesVerificationStatus(root_id, body) {
	const { responseData } = await patch(`/readouts_studies/verification_status/${root_id}`, body);
	return responseData?.data || {};
}
import { destroy, get, patch, post } from '../utils/api';

export async function fetchDrugStudies(queryParams) {
    const { responseData } = await get(`/studies/drugs?${new URLSearchParams(queryParams).toString()}`);
	return [responseData?.data || [], responseData.has_next, responseData?.meta || {}];
}

export async function createDrugStudy(body) {
	const { responseData } = await post('/studies/drugs', body);
	return responseData?.data || {};
}

export async function updateDrugStudy(id, body) {
	const { responseData } = await patch('/studies/drugs/' + id, body);
	return responseData?.data || {};
}

export async function deleteDrugStudy(id) {
	const { responseData } = await destroy('/studies/drugs/' + id);
	return responseData?.data || {};
}
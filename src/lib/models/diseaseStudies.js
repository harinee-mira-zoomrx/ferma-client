import { destroy, get, patch, post } from '../utils/api';

export async function fetchDiseaseStudies(queryParams) {
    const { responseData } = await get(`/studies/diseases?${new URLSearchParams(queryParams).toString()}`);
	return [responseData?.data || [], responseData.has_next, responseData?.meta || {}];
}

export async function createDiseaseStudy(body) {
	const { responseData } = await post('/studies/diseases', body);
	return responseData?.data || {};
}

export async function updateDiseaseStudy(id, body) {
	const { responseData } = await patch('/studies/diseases/' + id, body);
	return responseData?.data || {};
}

export async function deleteDiseaseStudy(id) {
	const { responseData } = await destroy('/studies/diseases/' + id);
	return responseData?.data || {};
}
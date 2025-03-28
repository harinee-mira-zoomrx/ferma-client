import { destroy, get, patch, post } from "@utils/api";

export async function fetchSynonymsDataTable(queryParams) {
	const { responseData } = await get(
		`/synonyms/data_table?${new URLSearchParams(queryParams).toString()}`
	);
	return [responseData?.data || [], responseData.has_next, responseData?.meta || {}];
}

export async function createSynonyms(body) {
    const { responseData } = await post('/synonyms', body);
    return responseData?.data || {};
}

export async function updateSynonyms(id, body) {
    const { responseData } = await patch('/synonyms/' + id, body);
    return responseData?.data || {};
}

export async function deleteSynonyms(id) {
    const { responseData } = await destroy('/synonyms/' + id);
    return responseData?.data || {};
}

export async function invalidateSynonyms(id) {
	const { responseData } = await destroy(`/synonyms/invalid/${id}`);
	return responseData?.data || {};
}

export async function updateSynonymVerificationStatus(root_id, body) {
	const { responseData } = await patch(`/synonyms/verification_status/${root_id}`, body);
	return responseData?.data || {};
}
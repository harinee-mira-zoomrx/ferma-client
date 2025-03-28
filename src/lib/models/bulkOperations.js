import { get, post } from '@utils/api.js';

export async function fetchBackgroundProcess(queryParams) {
	const { responseData } = await get(`/background_process?${new URLSearchParams(queryParams).toString()}`);
	return [responseData?.data || [], responseData.has_next];
}

export async function runBulkOperation(route, body) {
	let options = {
		noFormat: true,
		noContentType: "multipart/form-data"
	}
	const { responseData } = await post(`/${route}`, body, {}, options);
	return responseData?.data || {};
}

export const BULK_EVENT = {
	BULK_INSERT_ROOTS: 'Insert Roots',
	BULK_MERGE_ROOTS: 'Merge Roots',
	BULK_UPDATE_ROOTS_NAME: 'Update Roots Name',
	BULK_UPDATE_ROOT_LABEL: 'Update Roots Label',
	DOWNLOAD_ROOTS_LANDSCAPE_DETAILS: 'Download Roots Landscape Details',
	BULK_INSERT_SYNONYMS: 'Insert Synonyms',
	BULK_INSERT_RELATIONSHIPS: 'Insert Relationships',
	BULK_UPLOAD_INVALID_TERMS: 'Upload Invalid Terms',
	BULK_INSERT_READOUT_CONTENTS: 'Insert Content and Initiate Readout extraction',
}

export const BULK_EVENT_ROUTE = {
	BULK_INSERT_ROOTS: 'roots/bulk_insert_roots',
	BULK_MERGE_ROOTS: 'roots/bulk_merge_roots',
	BULK_UPDATE_ROOTS_NAME: 'roots/bulk_update_root_names',
	BULK_UPDATE_ROOT_LABEL: 'roots/bulk_update_root_labels',
	DOWNLOAD_ROOTS_LANDSCAPE_DETAILS: 'roots/bulk_check_roots_landscape',
	BULK_INSERT_SYNONYMS: 'synonyms/bulk_insert_synonyms',
	BULK_INSERT_RELATIONSHIPS: 'relationships/bulk_insert_relationships',
	BULK_UPLOAD_INVALID_TERMS: 'invalid_terms/bulk_invalidate_terms',
	BULK_INSERT_READOUT_CONTENTS: 'data_reviewer/contents/bulk_insert_readout_contents'
}


export const BULK_SAMPLE_FILE= {
	BULK_INSERT_ROOTS: 'bulk_insert_roots',
	BULK_MERGE_ROOTS: 'bulk_merge_roots',
	BULK_UPDATE_ROOTS_NAME: 'bulk_update_root_names',
	BULK_UPDATE_ROOT_LABEL: 'bulk_update_root_labels',
	BULK_CHECK_ROOT_INFO: 'bulk_check_roots_info',
	DOWNLOAD_ROOTS_LANDSCAPE_DETAILS: 'bulk_check_roots_landscape',
	BULK_INSERT_SYNONYMS: 'bulk_insert_synonyms',
	BULK_INSERT_SALES: 'bulk_insert_sales',
	BULK_INSERT_RELATIONSHIPS: 'bulk_insert_relationships',
	BULK_INSERT_ACTIVE_INGREDIENTS: 'bulk_insert_active_ingredients',
	BULK_OPERATIONS_DRUG_STUDIES: 'bulk_operations_drug_studies',
	BULK_OPERATIONS_DISEASE_STUDIES:'bulk_operations_disease_studies',
	BULK_OPERATIONS_ORGANIZATION_STUDIES: 'bulk_operations_organization_studies',
	BULK_OPERATIONS_TRIALS: 'bulk_operations_trials',
	BULK_UPLOAD_INVALID_TERMS: 'bulk_invalidate_terms',
	BULK_INSERT_READOUT_CONTENTS: 'bulk_insert_readout_contents'
}
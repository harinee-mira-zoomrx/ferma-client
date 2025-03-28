import { get, patch } from '@utils/api.js';

export const READOUTS_SECTION_TYPE = {
	BACKGROUND: 'BACKGROUND',
	STUDY_DESIGN: 'STUDY_DESIGN',
	SAFETY: 'SAFETY',
	EFFICACY: 'EFFICACY',
	CONCLUSION: 'CONCLUSION'
}

export const CONTENT_TYPE = {
	ABSTRACT: 'ABSTRACT',
	CONTENT: 'CONTENT'
}

export const STUDY_DESIGN_HEADERS = {
	CONTENT: ['Arms', 'Population', 'Other'],
	SUMMARY: ['Arms', 'Population', 'Enrollment', 'Other']
};

export async function fetchReadoutSections(readoutId, queryParams) {
	const { responseData } = await get(`/readouts_sections/${readoutId}?${new URLSearchParams(queryParams).toString()}`);
	return responseData || {};
}

export async function updateReadoutSections(readoutId, body) {
	const { responseData } = await patch('/readouts_sections/' + readoutId, body);
	return responseData || {};
}

import { get, post } from '@utils/api.js';
import { fetchRoots } from './roots';
import { queryConstructor } from '@utils/utility';

export async function fetchContents(queryParams) {
	const { responseData } = await get(
		`/data_reviewer/contents?${new URLSearchParams(queryParams).toString()}`
	);
	return [responseData?.data || [], responseData.has_next];
}

export async function downloadJSON(id) {
	const { responseData } = await get(
		`/data_reviewer/contents/extracted-text/${id}`
	);
	return responseData;
}

export async function uploadPDFFile(body) {
	let options = {
		noFormat: true,
		noContentType: 'multipart/form-data',
	};
	const { responseData } = await post(
		`/data_reviewer/contents/upload-file`,
		body,
		{},
		options
	);
	return responseData || {};
}

export function fetchSelectRootsByLabel(label) {
	return async (rootOptionsFilterText) => {
		let roots = [];
		try {
			let queryParam = [
				{
					key: 'label',
					operator: '==',
					value: label,
				},
				{
					key: 'name',
					operator: '=%',
					value: rootOptionsFilterText || '',
				},
			];
			roots = await fetchRoots({
				page: 1,
				size: 50,
				query: queryConstructor(queryParam),
				sort_by: 'name:asc',
			});
		} catch (error) {
			console.warn(error);
		}
		return roots.map((root) => ({
			label: root.name,
			value: root.name,
		}));
	};
}

export const DOCUMENT_COMPLEXITY = [
	{
		label: 'Simple',
		value: 'SIMPLE',
	},
	{
		label: 'Complex',
		value: 'COMPLEX',
	},
];

export const SOURCE_TYPE = [
	{
		label: 'Conference',
		value: 'CONFERENCE',
	},
	{
		label: 'Earnings Call Transcript',
		value: 'EARNINGS_CALL_TRANSCRIPT',
	},
	{
		label: 'Earnings Call Presentation',
		value: 'EARNINGS_CALL_PRESENTATION',
	},
	{
		label: 'Investor Report',
		value: 'INVESTOR_REPORT',
	},
	{
		label: 'SEC Filing',
		value: 'SEC_FILING',
	},
	{
		label: 'Corporate Presentations',
		value: 'CORPORATE_PRESENTATIONS',
	},
	{
		label: 'Journal',
		value: 'JOURNAL',
	},
	{
		label: 'News',
		value: 'NEWS',
	},
	{
		label: 'Press Release',
		value: 'PRESS_RELEASE',
	},
	{
		label: 'Other',
		value: 'OTHER',
	},
];

export const CONTENT_STATUS = [
	{
		label: 'New',
		value: 'NEW',
	},
	{
		label: 'Content Extraction Ongoing',
		value: 'CONTENT_EXTRACTION_ONGOING',
	},
	{
		label: 'Content Extraction Failed',
		value: 'CONTENT_EXTRACTION_FAILED',
	},
	{
		label: 'Content Extraction Complete',
		value: 'CONTENT_EXTRACTION_COMPLETE',
	}
];

import { get, post } from '../utils/api';

export async function fetchAllTasks(queryParams) {
	const { responseData } = await get(
		`/pipeline/tasks?${new URLSearchParams(queryParams).toString()}`
	);
	return [responseData?.data || [], responseData.has_next];
}

export async function retryTask(id) {
	const { responseData } = await post('/pipeline/tasks/retry/' + id);
	return responseData?.data || {};
}

export const ENTITY_TYPE = [
	{
		label: 'Content',
		value: 'content',
	},
	{
		label: 'Clinical Trial',
		value: 'trial',
	},
	{
		label: 'Readout',
		value: 'readout'
	}
];

export const TASK_NAME = [
	{
		label: 'Insight Generation',
		value: 'insight-generation',
	},
	{
		label: 'Website Extraction',
		value: 'website-extraction',
	},
	{
		label: 'Doc Extraction',
		value: 'doc-extraction',
	},
	{
		label: 'GPT Request',
		value: 'gpt-request',
	},
	{
		label: 'Source Handling',
		value: 'source-handling',
	},
	{
		label: 'Trial Update',
		value: 'trial-update',
	},
	{
		label: 'Org Extraction',
		value: 'org-extraction',
	},
	{
		label: 'Acronym Extraction',
		value: 'acronym-extraction',
	},
	{
		label: 'Indication Extraction',
		value: 'indication-extraction',
	},
	{
		label: 'Disease Extraction',
		value: 'disease-extraction',
	},
	{
		label: 'Drug Extraction',
		value: 'drug-extraction',
	},
	{
		label: 'Readout Metadata Extraction',
		value: 'readout-metadata-extraction',
	},
	{
		label: 'Readout Section Content Extraction',
		value: 'readout-section-content-extraction',
	},
	{
		label: 'Readout Section Summary Extraction',
		value: 'readout-section-summary-extraction',
	},
	{
		label: 'Readout Overview Extraction',
		value: 'readout-overview-extraction',
	},
];


export const TASK_STATUS = [
	{
		label: 'New',
		value: 'NEW',
	},
	{
		label: 'In Progress',
		value: 'IN_PROGRESS',
	},
	{
		label: 'Completed',
		value: 'COMPLETED',
	},
	{
		label: 'Partially Completed',
		value: 'PARTIALLY_COMPLETED',
	},
	{
		label: 'Failed',
		value: 'FAILED',
	},
	{
		label: 'Retrying',
		value: 'RETRYING',
	},
];

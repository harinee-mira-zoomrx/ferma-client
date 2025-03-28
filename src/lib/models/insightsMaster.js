import { get, patch } from '@utils/api.js';

export async function fetchInsightsMaster(queryParams) {
	const { responseData } = await get(
		`/data_reviewer/insights?${new URLSearchParams(queryParams).toString()}`
	);
	return [responseData?.data || [], responseData.has_next];
}

export async function updateStatus(id, data) {
	const { responseData } = await patch(`/data_reviewer/insights/${id}`, data);
	return responseData;
}

export async function fetchJSON(id) {
	const { responseData } = await get(`/data_reviewer/insights/${id}`);
	return responseData;
}

export const CATEGORY = [
	{
		label: 'Clinical Trials - Data',
		value: 'Clinical Trials - Data',
	},
	{
		label: 'Clinical Trials - Milestones',
		value: 'Clinical Trials - Milestones',
	},
	{
		label: 'Clinical Trials - Other',
		value: 'Clinical Trials - Other',
	},
	{
		label: 'Regulatory Activities',
		value: 'Regulatory Activities',
	},
	{
		label: 'Preclinical Studies / Data',
		value: 'Preclinical Studies / Data',
	},
	{
		label: 'Drug Approvals',
		value: 'Drug Approvals',
	},
	{
		label: 'Partnerships & Collaborations',
		value: 'Partnerships & Collaborations',
	},
	{
		label: 'Corporate & Financial Events',
		value: 'Corporate & Financial Events',
	},
	{
		label: 'Patents',
		value: 'Patents',
	},
	{
		label: 'Sales / Revenue',
		value: 'Sales / Revenue',
	},
	{
		label: 'Marketing & Communications',
		value: 'Marketing & Communications',
	},
	{
		label: 'Healthcare & Patient Initiatives',
		value: 'Healthcare & Patient Initiatives',
	},
	{
		label: 'Organizational Changes',
		value: 'Organizational Changes',
	},
];

export const INSIGHT_STATUS = [
	{
		label: 'New',
		value: 0,
	},
	{
		label: 'Processed',
		value: 1,
	},
];

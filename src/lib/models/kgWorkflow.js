import { get, patch } from '@utils/api.js';

export async function fetchKGWorkflow(queryParams) {
	const { responseData } = await get(
		`/data_reviewer/insights/attributes?${new URLSearchParams(queryParams).toString()}`
	);
	return [responseData?.data || [], responseData.has_next];
}

export async function updateStatus(id, data) {
	const { responseData } = await patch(
		`/data_reviewer/insights/attributes/${id}`,
		data
	);
	return responseData;
}

export const ATTRIBUTE = [
	{
		label: 'Organization',
		value: 'organization',
	},
	{
		label: 'Brand Name',
		value: 'brand_name',
	},
	{
		label: 'Active Ingredient',
		value: 'active_ingredient',
	},
	{
		label: 'Drug Class',
		value: 'drug_class',
	},
	{
		label: 'Drug Target',
		value: 'drug_target',
	},
	{
		label: 'NCT ID',
		value: 'NCT_id',
	},
	{
		label: 'Trial Acronym',
		value: 'trial_acronym',
	},
	{
		label: 'Trial Status',
		value: 'trial_status',
	},
	{
		label: 'Trial Phase',
		value: 'trial_phase',
	},
	{
		label: 'Approval Designation',
		value: 'approval_designation',
	},
	{
		label: 'Geography',
		value: 'geography',
	},
	{
		label: 'Indication',
		value: 'indication',
	},
	{
		label: 'Disease',
		value: 'disease',
	},
	{
		label: 'Therapeutic Area',
		value: 'therapeutic_area',
	},
	{
		label: 'Organization Stage',
		value: 'organization_stage',
	},
	{
		label: 'Parent Organization',
		value: 'parent_organization',
	},
	{
		label: 'Stock Exchange',
		value: 'stock_exchange',
	},
	{
		label: 'Stock Ticker',
		value: 'stock_ticker',
	},
	{
		label: 'Is Pharma Company',
		value: 'is_pharma_company',
	},
	{
		label: 'Sales',
		value: 'sales',
	},
	{
		label: 'Time Period',
		value: 'time_period',
	},
	{
		label: 'Preclinical Phase',
		value: 'preclinical_phase',
	},
];

export const ALLOWED_ATTRIBUTES = [
	{
		label: 'Brand Name',
		value: 'brand_name',
	},
	{
		label: 'Active Ingredient',
		value: 'active_ingredient',
	},
	{
		label: 'Drug Class',
		value: 'drug_class',
	},
	{
		label: 'Drug Target',
		value: 'drug_target',
	},
	{
		label: 'Therapeutic Area',
		value: 'therapeutic_area',
	},
	{
		label: 'Disease',
		value: 'disease',
	},
	{
		label: 'Trial Acronym',
		value: 'trial_acronym',
	},
];

export const FIELD_STATUS = [
	{
		label: 'New',
		value: 'NEW',
	},
	{
		label: 'Mismatch',
		value: 'MISMATCH',
	},
	{
		label: 'Invalid',
		value: 'INVALID',
	},
	{
		label: 'Verified',
		value: 'VERIFIED',
	},
	{
		label: 'Exists',
		value: 'EXISTS',
	},
];

import { get, patch } from '@utils/api.js';

export async function fetchDrugsWorkflow(queryParams) {
	const { responseData } = await get(
		`/data_reviewer/insights/relationships?${new URLSearchParams(queryParams).toString()}`
	);
	return [responseData?.data || [], responseData.has_next];
}

export async function updateStatus(id, data) {
	const { responseData } = await patch(
		`/data_reviewer/insights/relationships/${id}`,
		data
	);
	return responseData;
}

export const RELATIONSHIP_TYPE = [
	{
		label: 'Active Ingredient - Drug Class Mapping',
		value: 'Active Ingredient - Drug Class Mapping',
	},
	{
		label: 'Active Ingredient - Drug Target Mapping',
		value: 'Active Ingredient - Drug Target Mapping',
	},
	{
		label: 'Active Ingredient - Brand Mapping',
		value: 'Active Ingredient - Brand Mapping',
	},
	{
		label: 'NCT ID - Brand Mapping',
		value: 'NCT ID - Brand Mapping',
	},
	{
		label: 'NCT ID - Active Ingredient Mapping',
		value: 'NCT ID - Active Ingredient Mapping',
	},
	{
		label: 'NCT ID - Drug Class Mapping',
		value: 'NCT ID - Drug Class Mapping',
	},
	{
		label: 'NCT ID - Drug Target Mapping',
		value: 'NCT ID - Drug Target Mapping',
	},
	{
		label: 'NCT ID - Indication Mapping',
		value: 'NCT ID - Indication Mapping',
	},
	{
		label: 'NCT ID - Disease Mapping',
		value: 'NCT ID - Disease Mapping',
	},
	{
		label: 'NCT ID - Trial Acronym Mapping',
		value: 'NCT ID - Trial Acronym Mapping',
	},
	{
		label: 'Organization - Parent Organization Mapping',
		value: 'Organization - Parent Organization Mapping',
	},
];

export const ALLOWED_RELATIONSHIP_TYPES = [
	{
		label: 'Active Ingredient - Drug Class Mapping',
		value: 'Active Ingredient - Drug Class Mapping',
	},
	{
		label: 'Active Ingredient - Drug Target Mapping',
		value: 'Active Ingredient - Drug Target Mapping',
	},
	{
		label: 'Active Ingredient - Brand Mapping',
		value: 'Active Ingredient - Brand Mapping',
	},
];

export const RELATIONSHIP_STATUS = [
	{
		label: 'New',
		value: 'NEW',
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

export const PARENT_ATTRIBUTES = [
	{
		label: 'Active Ingredient',
		value: 'active_ingredient',
	},
];

export const CHILD_ATTRIBUTES = [
	{
		label: 'Drug Class',
		value: 'drug_class',
	},
	{
		label: 'Drug Target',
		value: 'drug_target',
	},
	{
		label: 'Brand Name',
		value: 'brand_name',
	},
];

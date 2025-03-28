import { get } from '@utils/api.js';

export async function fetchTrialsWorkflow(queryParams) {
	const { responseData } = await get(
		`/data_reviewer/trials?${new URLSearchParams(queryParams).toString()}`
	);
	return [responseData?.data || [], responseData.has_next];
}

export const TRIALS_ATTRIBUTE = [
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
		label: 'Indication',
		value: 'indication',
	},
	{
		label: 'Disease',
		value: 'disease',
	},
];

export const TRIALS_RELATIONSHIP_TYPE = [
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
];

export const TRIALS_PARENT_ATTRIBUTE = [
	{
		label: 'NCT ID',
		value: 'NCT_id',
	},
];

export const TRIALS_CHILD_ATTRIBUTE = [
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
		label: 'Trial Acronym',
		value: 'trial_acronym',
	},
	{
		label: 'Indication',
		value: 'indication',
	},
	{
		label: 'Disease',
		value: 'disease',
	},
];

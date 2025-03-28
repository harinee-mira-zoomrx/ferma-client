import { get } from '@utils/api.js';

export async function fetchFirmsWorkfow(queryParams) {
	const { responseData } = await get(
		`/data_reviewer/organizations?${new URLSearchParams(queryParams).toString()}`
	);
	return [responseData?.data || [], responseData.has_next];
}

export const FIRMS_ATTRIBUTE = [
	{
		label: 'Organization',
		value: 'organization',
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
];

export const FIRMS_RELATIONSHIP_TYPE = [
	{
		label: 'Organization - Parent Organization Mapping',
		value: 'Organization - Parent Organization Mapping',
	},
];

export const IS_PHARMA_COMPANY = [
	{
		label: 'True',
		value: '1',
	},
	{
		label: 'False',
		value: '0',
	},
];

export const FIRMS_PARENT_ATTRIBUTE = [
	{
		label: 'Organization',
		value: 'organization',
	},
];

export const FIRMS_CHILD_ATTRIBUTE = [
	{
		label: 'Parent Organization',
		value: 'parent_organization',
	},
];

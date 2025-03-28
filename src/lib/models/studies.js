import { get, post, patch } from '../utils/api';

export const STUDY_TYPE = {
	APPROVED: 'Approved',
	CLINICAL: 'Clinical',
	PRECLINICAL: 'Preclinical',
};

export async function fetchStudiesList(queryParams) {
	const { responseData } = await get(
		`/studies?${new URLSearchParams(queryParams).toString()}`
	);
	return [responseData?.data || [], responseData.has_next];
}

export async function fetchPreclinicalStudies(params) {
	const { responseData } = await get(
		`/studies/preclinical?${new URLSearchParams(params).toString()}`
	);
	return [responseData?.data || [], responseData.has_next];
}

export async function createPreclinicalStudy(body) {
	const { responseData } = await post('/studies/preclinical', body);
	return responseData?.data || {};
}

export async function fetchPreclinicalStudy(id) {
	const { responseData } = await get(`/studies/preclinical/${id}`);
	return responseData?.data || {};
}

export async function updatePreclinicalStudy(id, body) {
	const { responseData } = await patch(`/studies/preclinical/${id}`, body);
	return responseData?.data || {};
}

export async function fetchApprovedStudies(params) {
	const { responseData } = await get(
		`/studies/approved?${new URLSearchParams(params).toString()}`
	);
	return [responseData?.data || [], responseData.has_next];
}

export async function createApprovedStudy(body) {
	const { responseData } = await post('/studies/approved', body);
	return responseData?.data || {};
}

export async function fetchApprovedStudy(id) {
	const { responseData } = await get(`/studies/approved/${id}`);
	return responseData?.data || {};
}

export async function updateApprovedStudy(id, body) {
	const { responseData } = await patch(`/studies/approved/${id}`, body);
	return responseData?.data || {};
}

export const GEOGRAPHIES = [
	{ label: 'US', value: 'US' },
	{ label: 'China', value: 'CHINA' },
	{ label: 'UK', value: 'UK' },
	{ label: 'Japan', value: 'JAPAN' },
	{ label: 'South Korea', value: 'SOUTH_KOREA' },
	{ label: 'Canada', value: 'CANADA' },
	{ label: 'Australia', value: 'AUSTRALIA' },
	{ label: 'Europe', value: 'EUROPE' },
	{ label: 'Germany', value: 'GERMANY' },
	{ label: 'France', value: 'FRANCE' },
	{ label: 'Switzerland', value: 'SWITZERLAND' },
	{ label: 'Taiwan', value: 'TAIWAN' },
	{ label: 'Israel', value: 'ISRAEL' },
	{ label: 'India', value: 'INDIA' },
	{ label: 'Spain', value: 'SPAIN' },
	{ label: 'Netherlands', value: 'NETHERLANDS' },
	{ label: 'Italy', value: 'ITALY' },
	{ label: 'Sweden', value: 'SWEDEN' },
	{ label: 'Denmark', value: 'DENMARK' },
	{ label: 'Belgium', value: 'BELGIUM' },
	{ label: 'Brazil', value: 'BRAZIL' },
	{ label: 'Russian Federation', value: 'RUSSIAN_FEDERATION' },
	{ label: 'Mexico', value: 'MEXICO' },
	{ label: 'New Zealand', value: 'NEW_ZEALAND' },
	{ label: 'Hong Kong', value: 'HONG_KONG' },
	{ label: 'Norway', value: 'NORWAY' },
	{ label: 'Singapore', value: 'SINGAPORE' },
	{ label: 'South Africa', value: 'SOUTH_AFRICA' },
	{ label: 'Argentina', value: 'ARGENTINA' },
	{ label: 'Other', value: 'OTHER' },
];

export const REGULATORY_DESIGNATIONS = [
	'Orphan Drug',
	'Fast Track',
	'Priority Review',
	'Breakthrough Therapy',
	'Accelerated Approval',
	'Animal Rule',
	'Paediatric Investigation Plan',
	'Rare Pediatric Disease',
	'Standard Review',
	'New Active Substance',
	'Qualified Infectious Disease Product',
	'PRIME',
	'Regenerative Medicine Advanced Therapy',
	'Emergency Use Authorization',
	'Clinically Urgent Foreign Drug',
	'Advanced Therapy Medicinal Product',
	'Innovation Passport',
	'Promising Innovative Medicine',
	'National Science and Technology Major Project',
	'Innovative Licensing and Access Pathway',
	'Sakigake',
	'Early Access to Medicine Scheme',
	'Special Review Project',
	'Tropical Disease Priority Review',
	'505_b_2'
];

export const REGULATORY_DESIGNATION_STATUSES = [
	'Planned',
	'Filed',
	'Granted',
	'Positive Opinion',
	'Amendment',
	'Withdrawn',
	'Rejected',
	'Expired',
];
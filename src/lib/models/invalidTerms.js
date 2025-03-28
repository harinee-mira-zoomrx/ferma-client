import { get } from '../utils/api';

export async function fetchInvalidTerms(queryParams) {
	const { responseData } = await get(
		`/invalid_terms?${new URLSearchParams(queryParams).toString()}`
	);
	return [responseData?.data || [], responseData.has_next];
}

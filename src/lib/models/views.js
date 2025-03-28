import { get } from '../utils/api';
import downloadFileUsingBlob from '../utils/downloadFileUsingBlob';

export async function fetchViews(queryParams) {
	const { responseData } = await get(`/views?${new URLSearchParams(queryParams).toString()}`);
	return responseData?.data || [];
}

export async function fetchView(view, queryParams) {
	const { responseData } = await get(`/views/${view}?${new URLSearchParams(queryParams).toString()}`);
    return [responseData?.data || [], responseData.has_next];
}

export async function downloadView(view, queryParams) {
	queryParams = { ...queryParams, export: true };
	const { response } = await get(`/views/${view}?${new URLSearchParams(queryParams).toString()}`);
	const reader = response.body.getReader();
	const decoder = new TextDecoder('utf-8');
	let csvContent = '';

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		csvContent += decoder.decode(value, { stream: true });
	}
	downloadFileUsingBlob(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }), view);
}

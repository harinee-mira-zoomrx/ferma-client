import { destroy, get, patch, post } from '../utils/api';

export async function fetchDrugSales(queryParams) {
    const { responseData } = await get(`/sales?${new URLSearchParams(queryParams).toString()}`);
    return [responseData?.data || [], responseData.has_next];
}

export async function createDrugSale(body) {
    const { responseData } = await post('/sales', body);
    return responseData?.data || {};
}

export async function updateDrugSale(id, body) {
    const { responseData } = await patch('/sales/' + id, body);
    return responseData?.data || {};
}

export async function deleteDrugSale(id) {
    const { responseData } = await destroy('/sales/' + id);
    return responseData?.data || {};
}
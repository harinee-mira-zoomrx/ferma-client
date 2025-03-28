import { destroy, post, get, patch } from '../utils/api';

export async function fetchActiveIngredientList(queryParams) {
    const { responseData } = await get(
        `/active_ingredients?${new URLSearchParams(queryParams).toString()}`
    );
    return [responseData?.data || [], responseData.has_next];
}

export async function createActiveIngredientMoA(body) {
    const { responseData } = await post('/active_ingredients', body);
    return responseData?.data || {};
}

export async function updateActiveIngredientMoA(id, body) {
    const { responseData } = await patch('/active_ingredients/' + id, body);
    return responseData?.data || {};
}

export async function deleteActiveIngredientMoA(id) {
    const { responseData } = await destroy('/active_ingredients/' + id);
    return responseData?.data || {};
}
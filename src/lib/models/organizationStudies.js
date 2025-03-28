import { destroy, get, patch, post } from '../utils/api';

export async function fetchOrganizationStudies(queryParams) {
    const { responseData } = await get(`/studies/organizations?${new URLSearchParams(queryParams).toString()}`);
    return [responseData?.data || [], responseData.has_next, responseData?.meta || {}];
}

export async function createOrganizationStudy(body) {
    const { responseData } = await post('/studies/organizations', body);
    return responseData?.data || {};
}

export async function updateOrganizationStudy(id, body) {
    const { responseData } = await patch('/studies/organizations/' + id, body);
    return responseData?.data || {};
}

export async function deleteOrganizationStudy(id) {
    const { responseData } = await destroy('/studies/organizations/' + id);
    return responseData?.data || {};
}

export const ORGANIZATION_ROLE = {
    SPONSOR: 'Sponsor',
    COLLABORATOR: 'Collaborator',
    SOLO_OWNER: 'Solo-owner',
}
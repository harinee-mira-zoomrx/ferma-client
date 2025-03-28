import { get, patch, post } from '../utils/api';

export async function fetchOrganization(id) {
    const { responseData } = await get(`/organizations/${id}`);
    return responseData?.data;
}

export async function createOrganization(body) {
    const { responseData } = await post('/organizations', body);
    return responseData?.data || {};
}

export async function updateOrganization(id, body) {
    const { responseData } = await patch('/organizations/' + id, body);
    return responseData?.data || {};
}

export const ORGANIZATION_TYPE = {
    FIRM: 'Firm',
    INSTITUTION: 'Institution',
    OTHER: 'Other',
}
export const ORGANIZATION_STAGE = {
    PRECLINICAL: 'Preclinical',
    CLINICAL: 'Clinical',
    COMMERCIAL: 'Commercial',
    UNKNOWN: 'Unknown'
}
export const ORGANIZATION_SIZE = {
    SMALL: 'Small',
    MEDIUM: 'Medium',
    LARGE: 'Large',
    UNKNOWN: 'Unknown'
}
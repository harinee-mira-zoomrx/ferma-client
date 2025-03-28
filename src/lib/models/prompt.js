import { get, patch, post } from '../utils/api';

export async function fetchAllPrompts(queryParams) {
    const { responseData } = await get(
        `/pipeline/prompt?${new URLSearchParams(queryParams).toString()}`
    );
    return [responseData?.data || [], responseData.has_next];
}
export async function createPrompt(body) {
    const { responseData } = await post(`/pipeline/prompt`, body);
    return responseData?.data || {};
}

export async function fetchAllPromptsVersion(queryParams) {
    const { responseData } = await get(
        `/pipeline/prompt_version?${new URLSearchParams(queryParams).toString()}`
    );
    return [responseData?.data || [], responseData.has_next];
}

export async function createPromptVersion(body) {
    let options = {
        noFormat: true,
        noContentType: 'multipart/form-data',
    };
    const { responseData } = await post(`/pipeline/prompt_version`, body, {}, options);
    return responseData?.data || {};
}

export async function selectPromptVersion(id, promptVersionId) {
    const { responseData } = await patch(
        `/pipeline/prompt/${id}/prompt_version/${promptVersionId}`
    );
    return [responseData?.data || [], responseData.has_next];
}


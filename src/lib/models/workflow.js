import { get, post } from '../utils/api';

export async function fetchAllWorkflows(queryParams) {
    const { responseData } = await get(
        `/pipeline/workflows?${new URLSearchParams(queryParams).toString()}`
    );
    return [responseData?.data || [], responseData.has_next];
}

export const WORKFLOW_NAME = [
    {
        label: 'Insight Generation',
        value: 'INSIGHT_GENERATION',
    },
    {
        label: 'Readouts Generation',
        value: 'READOUTS',
    },
    {
        label: 'Trials Sourcing',
        value: 'TRIALS_SOURCING'
    },
    {
        label: 'Trials Processing',
        value: ' TRIAL_PROCESSING'
    },
    {
        label: 'Acronym Extraction',
        value: 'ACRONYM_EXTRACTION'
    },
    {
        label: 'Disease Extraction',
        value: 'DISEASE_EXTRACTION'
    },
    {
        label: 'Drug Extraction',
        value: 'DRUG_EXTRACTION'
    },
];


export const WORKFLOW_STATUS = [
    {
        label: 'New',
        value: 'NEW',
    },
    {
        label: 'In Progress',
        value: 'IN_PROGRESS',
    },
    {
        label: 'Completed',
        value: 'COMPLETED',
    },
    {
        label: 'Partially Completed',
        value: 'PARTIALLY_COMPLETED',
    },
    {
        label: 'Failed',
        value: 'FAILED',
    },
];

export const WORKFLOW_ENTITY_TYPE = [
    {
        label: 'Content',
        value: 'CONTENT',
    },
    {
        label: 'Timestamp',
        value: 'TIMESTAMP',
    },
    {
        label: 'Trial',
        value: 'TRIAL'
    }
];
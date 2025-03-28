import { destroy, get, post, patch } from "@utils/api";
import { ROOT_LABELS } from "./roots";

export const RELATIONSHIPS = {
    FIRM_HIERARCHY: 'Firm Hierarchy',
    DRUG_CLASS_HIERARCHY: 'Drug Class Hierarchy',
    DISEASE_HIERARCHY: 'Disease Hierarchy',
    TA_DISEASE_MAPPING: 'TA-Disease Mapping',
    ACTIVE_INGREDIENT_BRAND_MAPPING: 'Active Ingredient-Brand Mapping',
    ACTIVE_INGREDIENT_DRUG_CLASS_MAPPING: 'Active Ingredient-Drug Class Mapping',
    ACTIVE_INGREDIENT_TARGET_MAPPING: 'Active Ingredient-Target Mapping',
    INDICATION_ABBREVIATION_DISEASE_MAPPING: 'Indication Abbreviation-Disease Mapping',
    INDICATION_ABBREVIATION_PATIENT_SUBGROUP_MAPPING: 'Indication Abbreviation-Patient Subgroup Mapping',
    RESULTS_STAGE_HIERARCHY: 'Results Stage Hierarchy',
    ORGANIZATION_ACTIVE_INGREDIENT_MAPPING: 'Organization-Active Ingredient Mapping',
    ORGANIZATION_BRAND_MAPPING: 'Organization-Brand Mapping',
    DRUG_COMBINATION_REGIMEN_HIERARCHY: 'Drug Combination/Regimen Hierarchy',
    DRUG_COMBINATION_REGIMEN_BRAND_MAPPING: 'Drug Combination/Regimen-Brand Mapping',
    ORGANIZATION_DRUG_COMBINATION_REGIMEN_MAPPING: 'Organization-Drug Combination/Regimen Mapping',


}
export const RELATIONSHIP_MAPPING = {
    [ROOT_LABELS.ORGANIZATION]: {
        child: [{
            relationshipName: RELATIONSHIPS.FIRM_HIERARCHY,
            rootLabel: ROOT_LABELS.ORGANIZATION
        }, {
            relationshipName: RELATIONSHIPS.ORGANIZATION_ACTIVE_INGREDIENT_MAPPING,
            rootLabel: ROOT_LABELS.ACTIVE_INGREDIENT
        },  {
            relationshipName: RELATIONSHIPS.ORGANIZATION_BRAND_MAPPING,
            rootLabel: ROOT_LABELS.BRAND
        },
        {
            relationshipName: RELATIONSHIPS.ORGANIZATION_DRUG_COMBINATION_REGIMEN_MAPPING,
            rootLabel: ROOT_LABELS.DRUG_COMBINATION_REGIMEN
        }],
        parent: [{
            relationshipName: RELATIONSHIPS.FIRM_HIERARCHY,
            rootLabel: ROOT_LABELS.ORGANIZATION
        }],
    },
    [ROOT_LABELS.DRUG_CLASS]: {
        child: [{
            relationshipName: RELATIONSHIPS.DRUG_CLASS_HIERARCHY,
            rootLabel: ROOT_LABELS.DRUG_CLASS
        }],
        parent: [{
            relationshipName: RELATIONSHIPS.DRUG_CLASS_HIERARCHY,
            rootLabel: ROOT_LABELS.DRUG_CLASS
        }, {
            relationshipName: RELATIONSHIPS.ACTIVE_INGREDIENT_DRUG_CLASS_MAPPING,
            rootLabel: ROOT_LABELS.ACTIVE_INGREDIENT
        },
        {
            relationshipName: RELATIONSHIPS.DRUG_COMBINATION_REGIMEN_HIERARCHY,
            rootLabel: ROOT_LABELS.DRUG_COMBINATION_REGIMEN
        }
    ]
    },
    [ROOT_LABELS.DISEASE]: {
        child: [{
            relationshipName: RELATIONSHIPS.DISEASE_HIERARCHY,
            rootLabel: ROOT_LABELS.DISEASE
        }],
        parent: [{
            relationshipName: RELATIONSHIPS.DISEASE_HIERARCHY,
            rootLabel: ROOT_LABELS.DISEASE
        }, {
            relationshipName: RELATIONSHIPS.TA_DISEASE_MAPPING,
            rootLabel: ROOT_LABELS.THERAPY_AREA
        }, {
            relationshipName: RELATIONSHIPS.INDICATION_ABBREVIATION_DISEASE_MAPPING,
            rootLabel: ROOT_LABELS.INDICATION_ABBREVIATION
        }]
    },
    [ROOT_LABELS.TARGET]: {
        parent: [{
            relationshipName: RELATIONSHIPS.ACTIVE_INGREDIENT_TARGET_MAPPING,
            rootLabel: ROOT_LABELS.ACTIVE_INGREDIENT
        },
        {
            relationshipName: RELATIONSHIPS.DRUG_COMBINATION_REGIMEN_HIERARCHY,
            rootLabel: ROOT_LABELS.DRUG_COMBINATION_REGIMEN
        }]
    },
    [ROOT_LABELS.THERAPY_AREA]: {
        child: [{
            relationshipName: RELATIONSHIPS.TA_DISEASE_MAPPING,
            rootLabel: ROOT_LABELS.DISEASE
        }]
    },
    [ROOT_LABELS.ACTIVE_INGREDIENT]: {
        child:[{
            relationshipName: RELATIONSHIPS.ACTIVE_INGREDIENT_BRAND_MAPPING,
            rootLabel: ROOT_LABELS.BRAND
        }, {
            relationshipName: RELATIONSHIPS.ACTIVE_INGREDIENT_DRUG_CLASS_MAPPING,
            rootLabel: ROOT_LABELS.DRUG_CLASS
        }, {
            relationshipName: RELATIONSHIPS.ACTIVE_INGREDIENT_TARGET_MAPPING,
            rootLabel: ROOT_LABELS.TARGET
        }],
        parent:[{
            relationshipName: RELATIONSHIPS.ORGANIZATION_ACTIVE_INGREDIENT_MAPPING,
            rootLabel: ROOT_LABELS.ORGANIZATION
        },
        {
            relationshipName: RELATIONSHIPS.DRUG_COMBINATION_REGIMEN_HIERARCHY,
            rootLabel: ROOT_LABELS.DRUG_COMBINATION_REGIMEN
        }]
    },
    [ROOT_LABELS.BRAND]: {
        parent:[{
            relationshipName: RELATIONSHIPS.ACTIVE_INGREDIENT_BRAND_MAPPING,
            rootLabel: ROOT_LABELS.ACTIVE_INGREDIENT
        }, {
            relationshipName: RELATIONSHIPS.ORGANIZATION_BRAND_MAPPING,
            rootLabel: ROOT_LABELS.ORGANIZATION
        },
        {
            relationshipName: RELATIONSHIPS.DRUG_COMBINATION_REGIMEN_BRAND_MAPPING,
            rootLabel: ROOT_LABELS.DRUG_COMBINATION_REGIMEN
        }
    ]
    },
    [ROOT_LABELS.PATIENT_SUBGROUP]: {
        parent:[{
            relationshipName: RELATIONSHIPS.INDICATION_ABBREVIATION_PATIENT_SUBGROUP_MAPPING,
            rootLabel: ROOT_LABELS.INDICATION_ABBREVIATION
        }]
    },
    [ROOT_LABELS.INDICATION_ABBREVIATION]: {
        child:[{
            relationshipName: RELATIONSHIPS.INDICATION_ABBREVIATION_DISEASE_MAPPING,
            rootLabel: ROOT_LABELS.DISEASE
        }, {
            relationshipName: RELATIONSHIPS.INDICATION_ABBREVIATION_PATIENT_SUBGROUP_MAPPING,
            rootLabel: ROOT_LABELS.PATIENT_SUBGROUP
        }]
    },
    [ROOT_LABELS.RESULTS_STAGE]: {
        child: [{
            relationshipName: RELATIONSHIPS.RESULTS_STAGE_HIERARCHY,
            rootLabel: ROOT_LABELS.RESULTS_STAGE
        }],
        parent: [{
            relationshipName: RELATIONSHIPS.RESULTS_STAGE_HIERARCHY,
            rootLabel: ROOT_LABELS.RESULTS_STAGE
        }],
    },
    [ROOT_LABELS.DRUG_COMBINATION_REGIMEN]: {
        parent: [{
            relationshipName: RELATIONSHIPS.ORGANIZATION_DRUG_COMBINATION_REGIMEN_MAPPING,
            rootLabel: ROOT_LABELS.ORGANIZATION
        }],
        child: [
        {
            relationshipName: RELATIONSHIPS.DRUG_COMBINATION_REGIMEN_HIERARCHY,
            rootLabel: ROOT_LABELS.TARGET
        },
        {
            relationshipName: RELATIONSHIPS.DRUG_COMBINATION_REGIMEN_HIERARCHY,
            rootLabel: ROOT_LABELS.DRUG_CLASS
        },
        {
            relationshipName: RELATIONSHIPS.DRUG_COMBINATION_REGIMEN_HIERARCHY,
            rootLabel: ROOT_LABELS.ACTIVE_INGREDIENT
        },
        {
            relationshipName: RELATIONSHIPS.DRUG_COMBINATION_REGIMEN_BRAND_MAPPING,
            rootLabel: ROOT_LABELS.BRAND
        }
        
    ],
    },
}


export async function fetchRelationships(queryParams) {
    const { responseData } = await get(`/relationships?${new URLSearchParams(queryParams).toString()}`);
    return [responseData?.data ?? [], responseData?.has_next, responseData?.meta || {}];
}

export async function createRelationship(body) {
    const { responseData } = await post('/relationships', body);
    return responseData?.data || {};
}

export async function updateRelationship(id, body) {
    const { responseData } = await patch(`/relationships/${id}`, body);
    return responseData?.data || {};
}

export async function deleteRelationship(id) {
    const { responseData } = await destroy('/relationships/' + id);
    return responseData?.data || {};
}
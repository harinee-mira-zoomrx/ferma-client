import { queryConstructor } from '@utils/utility';
import { get, patch, post, destroy } from '../utils/api';

export async function fetchRoots(queryParams) {
	const { responseData } = await get(`/roots?${new URLSearchParams(queryParams).toString()}`);
	return responseData?.data || [];
}

export async function fetchRootsSynonyms(queryParams) {
	const { responseData } = await get(`/roots/synonym_combination?${new URLSearchParams(queryParams).toString()}`);
	return responseData?.data || [];
}

export async function fetchRoot(id, queryParams) {
	const { responseData } = await get(`/roots/${id}?${new URLSearchParams(queryParams).toString()}`);
	return responseData || {};
}

export async function fetchRootsDataTable(queryParams) {
    const { responseData } = await get(
        `/roots/data_table?${new URLSearchParams(queryParams).toString()}`
    );
    return [responseData?.data || [], responseData.has_next];
}

export async function checkRootName(queryParams) {
	const { responseData } = await get(`/roots/check_root_name?${new URLSearchParams(queryParams).toString()}`);
	return responseData || {};
}

export async function createRoot(body) {
	const { responseData } = await post('/roots', body);
	return responseData?.data || {};
}

export async function updateRoot(id, body) {
	const { responseData } = await patch('/roots/' + id, body);
	return responseData?.data || {};
}

export async function mergeRoot(sourceId, targetId, invalidSource = false) {
	const { responseData } = await post('/roots/merge', {
		source_id: sourceId,
		target_id: targetId,
		invalid_source: invalidSource
	});
	return responseData?.data || {};
}

export async function updateLabel(id, newLabel) {
	const { responseData } = await post('/roots/update_label', {
		root_id: id,
		new_label: newLabel,
	});
	return responseData?.data || {};
}

export async function fetchRootLandscape(id) {
	const { responseData } = await get(`/roots/root_landscape/${id}`);
	return responseData?.data || {};
}

export async function invalidateRoot(id) {
	const { responseData } = await destroy(`/roots/invalid/${id}`);
	return responseData?.data || {};
}

export const ROOT_LABELS = {
	ORGANIZATION: 'Organization',
	BRAND: 'Brand',
	ACTIVE_INGREDIENT: 'Active Ingredient',
	DRUG_CLASS: 'Drug Class',
	TARGET: 'Target',
	DISEASE: 'Disease',
	THERAPY_AREA: 'Therapy Area',
	PATIENT_SUBGROUP: 'Patient Subgroup',
	TRIAL_ACRONYM: 'Trial Acronym',
	INDICATION_ABBREVIATION: 'Indication Abbreviation',
	RESULTS_STAGE: 'Results Stage',
	DRUG_COMBINATION_REGIMEN: 'Drug Combination/Regimen'
}


export function fetchSelectRootsByLabel(label) {
	return async (rootOptionsFilterText) => {
		let roots = [];
		try {
			let queryParam = [
				{
					key: 'label',
					operator: '==',
					value: label,
				}, {
					key: 'name',
					operator: '=%',
					value: rootOptionsFilterText || '',
				},
			];
			roots = await fetchRoots({
				page: 1,
				size: 50,
				query: queryConstructor(queryParam),
				sort_by: 'name:asc'
			});
		} catch (error) {
			console.warn(error);
		}
		return roots.map((root) => ({
			label: root.name,
			value: root.id,
			data: root,
		}));
	};
}

/**
 * Fetch roots and synonyms based on a single label or an array of labels.
 *
 * @param {string | string[]} label - A single label as a string, or multiple labels as an array of strings.
 */
export function fetchSelectRootsSynonymsByLabel(label) {
	return async (rootOptionsFilterText) => {
		let results = [];
		let roots = [];
		let synonyms = [];
		try {
			let queryParam = Array.isArray(label)
				? [{ key: 'label', operator: 'in', value: label.join(':') }]
				: [{ key: 'label', operator: '==', value: label }];

			results = await fetchRootsSynonyms({
				page: 1,
				size: 20,
				query: queryConstructor(queryParam),
				search: rootOptionsFilterText || '',
				sort_by: 'name:asc',
			});
		} catch (error) {
			console.warn(error);
		}
		results.forEach((result) => {
			if (result.synonyms_id) {
				synonyms.push({
					label: result.synonyms_name,
					value: result.root_id,
					group: result.root_name,
					id: result.synonyms_id,
					data: {
						name: result.synonyms_name,
						id: result.synonyms_id,
						label: result.label
					}
				})
			} else {
				roots.push({
					label: result.root_name,
					value: result.root_id,
					data: result,
					group: result.root_name,
					id: result.root_id
				})
		    }
		});
		function compare(a, b) {
			const nameA = a.label;
			const nameB = b.label;

			let comparison = 0;
			if (nameA > nameB) {
				comparison = 1;
			} else if (nameA < nameB) {
				comparison = -1;
			}
			return comparison;
		}
		return Object.values([...roots, ...synonyms].reduce((options, option) => {
			if (options[option.value]) {
				options[option.value].additionalLabel.push(option.label);
			} else {
				options[option.value] = {
					label: option.group,
					value: option.value,
					data: option.data,
					id: option.value,
					additionalLabel: [option.label]
				}
			}
			return options;
		}, {})).sort(compare).map((option) => {
			option.additionalLabel = option.additionalLabel
				.filter((label) => label !== option.label)
				.join('\n') || null;
			return option;
		})
	};
}

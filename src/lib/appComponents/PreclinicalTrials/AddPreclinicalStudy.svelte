<script>
	import DynamicForm from '@components/DynamicForm/DynamicForm.svelte';
	import { loader } from '@components/Loader/Loader';
	import { toasts } from '@components/Toast/toasts';
	import { COMPONENT_TYPES, VERIFICATION_STATUS } from '@utils/constants';
	import {
		transformSnakeToCapitalized,
		validateURL,
		queryConstructor,
		debounce,
	} from '@utils/utility';
	import isEmpty from '@utils/is-empty';
	import { createPreclinicalStudy, GEOGRAPHIES } from '@models/studies';
	import {
		fetchSelectRootsSynonymsByLabel,
		ROOT_LABELS,
	} from '@models/roots';
	import { fetchRelationships, RELATIONSHIPS } from '@models/relationships';
	import { push } from 'svelte-spa-router';

	let selectedActiveIngredient = null;
	let selectedRegimen = null;
	let selectedVerificationStatus = VERIFICATION_STATUS.NOT_VERIFIED;
	let selectedDiseases = null;
	let selectedDrugClass = null;
	let selectedTarget = null;
	let drugClasses = [];
	let targets = [];
	let therapyArea = null;

	const onActiveIngredientChange = async () => {
		try {
			if (!selectedActiveIngredient) {
				drugClasses = [];
				targets = [];
				return;
			}
			let queryParam = [
				{
					key: 'parent_root_id',
					operator: '==',
					value: selectedActiveIngredient.id,
				},
				{
					key: 'relationship',
					operator: 'in',
					value: [
						RELATIONSHIPS.ACTIVE_INGREDIENT_DRUG_CLASS_MAPPING,
						RELATIONSHIPS.ACTIVE_INGREDIENT_TARGET_MAPPING,
					].join(':'),
				},
			];
			const [relationshipData] = await fetchRelationships({
				page: 1,
				size: 50,
				query: queryConstructor(queryParam),
			});
			drugClasses = relationshipData
				.filter(
					(item) => item.child_root_label == ROOT_LABELS.DRUG_CLASS
				)
				.map((item) => ({
					id: item.child_root_id,
					name: item.child_root_name,
				}));
			targets = relationshipData
				.filter((item) => item.child_root_label == ROOT_LABELS.TARGET)
				.map((item) => ({
					id: item.child_root_id,
					name: item.child_root_name,
				}));
		} catch (error) {
			console.error('Error fetching drug class and targer:', error);
			toasts.error('Failed to fetch drug class and targer.');
			drugClasses = [];
			targets = [];
		}
	};
	const onDiseaseChange = async () => {
		try {
			const diseases = selectedDiseases || [];
			if (diseases.length === 0) {
				therapyArea = [];
				return;
			}
			const diseaseIds = diseases.map((d) => d.id);
			let queryParam = [
				{
					key: 'child_root_id',
					operator: 'in',
					value: diseaseIds.join(':'),
				},
				{
					key: 'relationship',
					operator: '==',
					value: RELATIONSHIPS.TA_DISEASE_MAPPING,
				},
			];
			const [relationshipData] = await fetchRelationships({
				page: 1,
				size: 50,
				query: queryConstructor(queryParam),
			});
			const therapyItems = [];
			relationshipData.forEach((item) => {
				if (!therapyItems.some((t) => t.id === item.parent_root_id)) {
					therapyItems.push({
						id: item.parent_root_id,
						name: item.parent_root_name,
					});
				}
			});
			therapyArea = therapyItems;
		} catch (error) {
			console.error('Error fetching therapy area:', error);
			toasts.error('Failed to fetch therapy area.');
			therapyArea = [];
		}
	};

	const debouncedOnActiveIngredientChange = debounce(
		onActiveIngredientChange,
		400
	);
	const debouncedOnDiseaseChange = debounce(onDiseaseChange, 400);

	$: if (selectedActiveIngredient) {
		debouncedOnActiveIngredientChange();
	}

	$: if (selectedDiseases) {
		debouncedOnDiseaseChange();
	}
	$: config = [
		{
			type: COMPONENT_TYPES.ROOT_SELECT_PILL,
			props: {
				name: 'company_root_ids',
				label: 'Companies',
				rootLabel: ROOT_LABELS.ORGANIZATION,
				allowCreate: true,
				multiple: true,
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.ROOT_SELECT_PILL,
			props: {
				name: 'active_ingredient_root_id',
				label: 'Active Ingredient',
				rootLabel: ROOT_LABELS.ACTIVE_INGREDIENT,
				onSelect: (event, value) => {
					selectedActiveIngredient = value || null;
					drugClasses = [];
					targets = [];
				},
				disabled: !isEmpty(selectedRegimen),
				allowCreate: true,
			},
		},
		{
			type: COMPONENT_TYPES.ROOT_SELECT_PILL,
			props: {
				name: 'drug_combination_regimen_root_id',
				label: 'Drug Combination / Regimen',
				rootLabel: ROOT_LABELS.DRUG_COMBINATION_REGIMEN,
				onSelect: (event, value) => (selectedRegimen = value || null),
				disabled:
					!isEmpty(selectedActiveIngredient) ||
					!isEmpty(selectedDrugClass) ||
					!isEmpty(selectedTarget),
				allowCreate: true,
			},
		},
		{
			type: COMPONENT_TYPES.LINK_LIST,
			props: {
				label: `Drug Classes mapped for ${selectedActiveIngredient?.label}`,
				items: drugClasses,
				getHref: (item) => `#/roots/${item.id}`,
			},
			hide: isEmpty(selectedActiveIngredient),
		},
		{
			type: COMPONENT_TYPES.ROOT_SELECT_PILL,
			props: {
				name: 'drug_class_root_ids',
				label: 'Drug Class',
				rootLabel: ROOT_LABELS.DRUG_CLASS,
				onSelect: (event, value) => {
					selectedDrugClass = value || null;
				},
				disabled: !isEmpty(selectedRegimen),
				allowCreate: true,
				multiple: true,
			},
		},
		{
			type: COMPONENT_TYPES.LINK_LIST,
			props: {
				label: `Targets mapped for ${selectedActiveIngredient?.label}`,
				items: targets,
				getHref: (item) => `#/roots/${item.id}`,
			},
			hide: isEmpty(selectedActiveIngredient),
		},
		{
			type: COMPONENT_TYPES.ROOT_SELECT_PILL,
			props: {
				name: 'target_root_ids',
				label: 'Target',
				rootLabel: ROOT_LABELS.TARGET,
				onSelect: (event, value) => {
					selectedTarget = value || null;
				},
				disabled: !isEmpty(selectedRegimen),
				allowCreate: true,
				multiple: true,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'indication',
				label: 'Indication',
				placeholder: 'Enter indication',
				required: true,
				width: '75%',
			},
		},
		{
			type: COMPONENT_TYPES.ROOT_SELECT_PILL,
			props: {
				name: 'disease_root_ids',
				label: 'Disease',
				rootLabel: ROOT_LABELS.DISEASE,
				onSelect: (event, value) => {
					selectedDiseases = value || [];
					therapyArea = [];
				},
				allowCreate: true,
				multiple: true,
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.LINK_LIST,
			props: {
				label: 'Therapy Area',
				items: therapyArea,
				getHref: (item) => `#/roots/${item.id}`,
			},
			hide: isEmpty(selectedDiseases),
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'development_phase',
				label: 'Development Phase',
				placeholder: 'Enter development phase',
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'study_date',
				label: 'Study Date',
				placeholder: 'Enter study date',
				type: 'date',
			},
		},
		{
			type: COMPONENT_TYPES.SELECT_BOX,
			props: {
				name: 'geography',
				label: 'Geography ',
				placeholder: 'Select geography',
				items: GEOGRAPHIES,
				clearFilterTextOnBlur: true,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'source',
				label: 'Source URL',
				placeholder: 'Enter source url',
				required: true,
			},
			validation: (url) => {
				if (validateURL(url)) return true;
				toasts.warn('Please provide a valid source url.');
				return false;
			},
		},
		{
			type: COMPONENT_TYPES.SEGMENT_PILL,
			props: {
				name: 'verification_status',
				label: 'Verification Status',
				items: Object.values(VERIFICATION_STATUS).map((key) => {
					return {
						label: transformSnakeToCapitalized(key),
						value: key,
					};
				}),
				required: true,
				onClickHandler: (e) => (selectedVerificationStatus = e.value),
			},
			preserveUnchangedData: true,
		},
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				label: 'Comment',
				placeholder: 'Enter a comment',
				name: 'comment',
				required:
					selectedVerificationStatus ===
					VERIFICATION_STATUS.ESCALATED,
			},
		},
		{
			type: COMPONENT_TYPES.BUTTON,
			props: [{ name: 'Save', type: 'primary', buttonType: 'submit' }],
		},
	];

	let onSubmit = async (e) => {
		try {
			loader.show();
			const data = e.detail;
			Object.keys(data).forEach((key) => {
				if (data[key] == null || data[key] === 'undefined') {
					delete data[key];
				}
			});
			if (
				isEmpty(data.active_ingredient_root_id) &&
				isEmpty(data.drug_combination_regimen_root_id) &&
				isEmpty(data.drug_class_root_ids) &&
				isEmpty(data.target_root_ids)
			) {
				toasts.error(
					'At least one of Active Ingredient, Drug Combination / Regimen, Drug Class and Target fields must be filled'
				);
				return;
			}
			const response = await createPreclinicalStudy(data);
			toasts.success('Study created successfully');
			push(`/preclinical-trials`);
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	};
</script>

<DynamicForm fullWidth={true} {config} columns={0} on:submit={onSubmit} />

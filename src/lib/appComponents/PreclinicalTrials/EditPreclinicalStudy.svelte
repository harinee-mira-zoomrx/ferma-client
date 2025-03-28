<script>
	import { onMount } from 'svelte';
	import Selectbox from '@components/Selectbox/Selectbox.svelte';
	import Input from '@components/Input/Input.svelte';
	import Textarea from '@components/Textarea/Textarea.svelte';
	import LinkList from '@components/LinkList/LinkList.svelte';
	import SegmentPill from '@components/SegmentPill/SegmentPill.svelte';
	import Button from '@components/Button/Button.svelte';
	import DiffModal from '@components/DynamicForm/DiffModal/DiffModal.svelte';
	import { loader } from '@components/Loader/Loader';
	import { toasts } from '@components/Toast/toasts';
	import { VERIFICATION_STATUS } from '@utils/constants';
	import { ROOT_LABELS } from '@models/roots';
	import { fetchRelationships, RELATIONSHIPS } from '@models/relationships';
	import {
		fetchPreclinicalStudy,
		updatePreclinicalStudy,
		GEOGRAPHIES,
	} from '@models/studies';
	import {
		transformSnakeToCapitalized,
		validateURL,
		queryConstructor,
		debounce,
	} from '@utils/utility';
	import isEmpty from '@utils/is-empty';
	import { push } from 'svelte-spa-router';
	import RootSelectPill from '@appComponents/RootSelectPill/RootSelectPill.svelte';

	export let id;

	let formData = {
		organization: [],
		active_ingredient: null,
		drug_combination_regimen: null,
		drug_class: [],
		target: [],
		indication: '',
		disease: [],
		development_phase: null,
		study_date: null,
		geography: null,
		source_url: null,
		verification_status: null,
		comment: null,
	};
	let initialData;
	let therapyArea = [];
	let drugClasses = [];
	let targets = [];

	let editedData;
	let formChanges;
	let showDiffModal = false;

	$: if (!isEmpty(formData.drug_combination_regimen)) {
		formData.active_ingredient = null;
		formData.drug_class = [];
		formData.target = [];
	}

	$: if (formData.active_ingredient) {
		formData.drug_combination_regimen = null;
	}

	const onActiveIngredientChange = async () => {
		try {
			if (!formData.active_ingredient) {
				drugClasses = [];
				targets = [];
				return;
			}
			let queryParam = [
				{
					key: 'parent_root_id',
					operator: '==',
					value: formData.active_ingredient.value,
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
			const diseases = formData.disease || [];
			if (diseases.length === 0) {
				therapyArea = [];
				return;
			}
			const diseaseIds = diseases.map((d) => d.value);
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

	function buildDiffData(changes) {
		let diffData = [];
		for (const key in changes) {
			diffData.push({
				label: key,
				original: getValue(initialData, key),
				edited: getValue(formData, key),
			});
		}
		return diffData;
	}

	const transformData = (studyData) => {
		let data = { ...studyData };
		for (const key in data) {
			if (isEmpty(data[key])) continue;
			if (Array.isArray(data[key])) {
				data[key] = data[key].map((item) => item.value);
			} else if (typeof data[key] === 'string') {
				continue;
			} else if (typeof data[key] === 'object') {
				data[key] = data[key].value;
			}
		}

		return data;
	};

	const getValue = (data, key) => {
		if (isEmpty(data[key])) {
			return null;
		}
		if (Array.isArray(data[key])) {
			return data[key].map((item) => item.label).join(', ');
		} else if (typeof data[key] === 'string') {
			return data[key];
		} else if (typeof data[key] === 'object') {
			return data[key].label;
		}
	};

	function deepEqual(a, b) {
		if (isEmpty(a) && isEmpty(b)) return true;
		return JSON.stringify(a) === JSON.stringify(b);
	}

	function computeChanges(formattedFormData, formattedInitialData) {
		let changes = {};
		for (const key in formattedFormData) {
			if (!deepEqual(formattedFormData[key], formattedInitialData[key])) {
				changes[key] = formattedFormData[key];
			}
		}
		return changes;
	}

	const onUpdateHandler = (event) => {
		event.preventDefault();
		if (
			isEmpty(formData.active_ingredient) &&
			isEmpty(formData.drug_combination_regimen) &&
			isEmpty(formData.drug_class) &&
			isEmpty(formData.target)
		) {
			toasts.error(
				'At least one of Active Ingredient, Drug Combination / Regimen, Drug Class and Target fields must be filled'
			);
			return;
		}

		if (!validateURL(formData.source_url)) {
			toasts.warn('Please provide a valid source url.');
			return;
		}

		let formattedFormData = transformData(formData);
		let formattedInitialData = transformData(initialData);

		formChanges = computeChanges(formattedFormData, formattedInitialData);
		if (Object.keys(formChanges).length === 0) {
			toasts.warn('No changes to update.');
			return;
		}
		editedData = buildDiffData(formChanges);
		showDiffModal = true;
	};

	const confirmSubmit = async () => {
		let payload = {};
		for (const key in formChanges) {
			if (key === 'organization') {
				payload['company_root_ids'] = isEmpty(formChanges[key])
					? null
					: formChanges[key];
			} else if (key === 'active_ingredient') {
				payload['active_ingredient_root_id'] = isEmpty(formChanges[key])
					? null
					: formChanges[key];
			} else if (key === 'drug_combination_regimen') {
				payload['drug_combination_regimen_root_id'] = isEmpty(
					formChanges[key]
				)
					? null
					: formChanges[key];
			} else if (key === 'drug_class') {
				payload['drug_class_root_ids'] = isEmpty(formChanges[key])
					? null
					: formChanges[key];
			} else if (key === 'target') {
				payload['target_root_ids'] = isEmpty(formChanges[key])
					? null
					: formChanges[key];
			} else if (key === 'disease') {
				payload['disease_root_ids'] = isEmpty(formChanges[key])
					? null
					: formChanges[key];
			} else if (key === 'source_url') {
				payload['source'] = isEmpty(formChanges[key])
					? null
					: formChanges[key];
			} else {
				payload[key] = isEmpty(formChanges[key])
					? null
					: formChanges[key];
			}
		}
		loader.show();
		try {
			await updatePreclinicalStudy(id, payload);
			await fetchdata();

			toasts.success('Study updated successfully');
		} catch (error) {
			toasts.error(error.message || 'Error updating study');
		} finally {
			loader.hide();
		}
	};

	const getTherapyAreas = (diseases) => {
		const results = [];
		const seenIds = new Set();

		for (const disease of diseases) {
			if (isEmpty(disease.therapy_area)) continue;
			for (const area of disease.therapy_area) {
				if (
					area.root_id &&
					area.root_name &&
					!seenIds.has(area.root_id)
				) {
					seenIds.add(area.root_id);
					results.push({
						id: area.root_id,
						name: area.root_name.trim(),
					});
				}
			}
		}

		return results;
	};

	const fetchdata = async () => {
		try {
			loader.show();
			const response = await fetchPreclinicalStudy(id);
			initialData = { ...response };
			if (!isEmpty(initialData.disease)) {
				therapyArea = getTherapyAreas(initialData.disease);
				initialData.disease = initialData.disease.map((disease) => ({
					value: disease.root_id,
					label: disease.root_name,
				}));
			}
			if (!isEmpty(initialData.organization)) {
				initialData.organization = initialData.organization.map(
					(organization) => ({
						value: organization.root_id,
						label: organization.root_name,
					})
				);
			}
			if (!isEmpty(initialData.active_ingredient)) {
				drugClasses = initialData.active_ingredient[0].drug_classes.map(
					(item) => ({ id: item.root_id, name: item.root_name })
				);
				targets = initialData.active_ingredient[0].targets.map(
					(item) => ({ id: item.root_id, name: item.root_name })
				);
				initialData.active_ingredient = {
					value: initialData.active_ingredient[0].root_id,
					label: initialData.active_ingredient[0].root_name,
				};
			} else {
				initialData.active_ingredient = null;
			}
			if (!isEmpty(initialData.drug_combination_regimen)) {
				initialData.drug_combination_regimen = {
					value: initialData.drug_combination_regimen[0].root_id,
					label: initialData.drug_combination_regimen[0].root_name,
				};
			} else {
				initialData.drug_combination_regimen = null;
			}
			if (!isEmpty(initialData.drug_class)) {
				initialData.drug_class = initialData.drug_class.map(
					(drug_class) => ({
						value: drug_class.root_id,
						label: drug_class.root_name,
					})
				);
			}
			if (!isEmpty(initialData.target)) {
				initialData.target = initialData.target.map((target) => ({
					value: target.root_id,
					label: target.root_name,
					...target,
				}));
			}
			formData = { ...initialData };
		} catch (error) {
			toasts.error(error);
			push('/preclinical-trials');
		} finally {
			loader.hide();
		}
	};

	onMount(() => {
		fetchdata();
	});
</script>

<form on:submit|preventDefault={onUpdateHandler} class="form">
	<div class="form__element">
		<RootSelectPill
			name="organization"
			label="Companies"
			bind:value={formData.organization}
			rootLabel={ROOT_LABELS.ORGANIZATION}
			allowCreate={true}
			multiple={true}
			required={true}
		/>
	</div>
	<div class="form__element">
		<RootSelectPill
			name="active_ingredient"
			label="Active Ingredient"
			bind:value={formData.active_ingredient}
			rootLabel={ROOT_LABELS.ACTIVE_INGREDIENT}
			onSelect={(event) => {
				drugClasses = [];
				targets = [];
				debouncedOnActiveIngredientChange();
			}}
			allowCreate={true}
			disabled={!isEmpty(formData.drug_combination_regimen)}
		/>
	</div>
	<div class="form__element">
		<RootSelectPill
			name="drug_combination_regimen"
			label="Drug Combination / Regimen"
			bind:value={formData.drug_combination_regimen}
			rootLabel={ROOT_LABELS.DRUG_COMBINATION_REGIMEN}
			allowCreate={true}
			disabled={!isEmpty(formData.active_ingredient) ||
				!isEmpty(formData.drug_class) ||
				!isEmpty(formData.target)}
		/>
	</div>
	{#if !isEmpty(formData.active_ingredient)}
		<div class="form__element">
			<LinkList
				label={`Drug Classes mapped for ${formData.active_ingredient.label}`}
				items={drugClasses}
				getHref={(item) => `#/roots/${item.id}`}
			/>
		</div>
	{/if}
	<div class="form__element">
		<RootSelectPill
			name="drug_class"
			label="Drug Class"
			bind:value={formData.drug_class}
			rootLabel={ROOT_LABELS.DRUG_CLASS}
			allowCreate={true}
			disabled={!isEmpty(formData.drug_combination_regimen)}
			multiple={true}
		/>
	</div>
	{#if !isEmpty(formData.active_ingredient)}
		<div class="form__element">
			<LinkList
				label={`Targets mapped for ${formData.active_ingredient.label}`}
				items={targets}
				getHref={(item) => `#/roots/${item.id}`}
			/>
		</div>
	{/if}
	<div class="form__element">
		<RootSelectPill
			name="targets"
			label="Target"
			bind:value={formData.target}
			rootLabel={ROOT_LABELS.TARGET}
			allowCreate={true}
			disabled={!isEmpty(formData.drug_combination_regimen)}
			multiple={true}
		/>
	</div>
	<div class="form__element">
		<Input
			name="indication"
			label="Indication"
			bind:value={formData.indication}
			placeholder="Enter indication"
			required={true}
		/>
	</div>
	<div class="form__element">
		<RootSelectPill
			name="disease"
			label="Disease"
			bind:value={formData.disease}
			rootLabel={ROOT_LABELS.DISEASE}
			onSelect={(event) => {
				therapyArea = [];
				debouncedOnDiseaseChange();
			}}
			allowCreate={true}
			multiple={true}
			required={true}
		/>
	</div>
	{#if !isEmpty(formData.disease)}
		<div class="form__element">
			<LinkList
				label="Therapy Area"
				items={therapyArea}
				getHref={(item) => `#/roots/${item.id}`}
			/>
		</div>
	{/if}
	<div class="form__element">
		<Input
			name="development_phase"
			label="Development Phase"
			bind:value={formData.development_phase}
			placeholder="Enter development phase"
			required={true}
		/>
	</div>
	<div class="form__element">
		<Input
			name="study_date"
			label="Study Date"
			bind:value={formData.study_date}
			placeholder="Enter study date"
			type="date"
		/>
	</div>
	<div class="form__element">
		<Selectbox
			name="geography"
			label="Geography"
			bind:value={formData.geography}
			placeholder="Select geography type"
			items={GEOGRAPHIES}
			clearFilterTextOnBlur={true}
			clearable={true}
		/>
	</div>
	<div class="form__element">
		<Input
			name="source_url"
			label="Source URL"
			bind:value={formData.source_url}
			placeholder="Enter source url"
			required={true}
		/>
	</div>
	<div class="form__element">
		<SegmentPill
			name="verification_status"
			label="Verification Status"
			bind:value={formData.verification_status}
			items={Object.values(VERIFICATION_STATUS).map((key) => ({
				label: transformSnakeToCapitalized(key),
				value: key,
			}))}
			required={true}
		/>
	</div>
	<div class="form__element">
		<Textarea
			name="comment"
			label="Comment"
			bind:value={formData.comment}
			placeholder="Enter a comment"
			onInput={(event) =>
				(formData.comment = event.target.textContent || '')}
			required={formData.verification_status ===
				VERIFICATION_STATUS.ESCALATED ||
				formData.verification_status?.value ===
					VERIFICATION_STATUS.ESCALATED}
		/>
	</div>
	<div class="form__btn-container">
		<Button type="primary" buttonType="submit">Update</Button>
	</div>
</form>

{#if showDiffModal}
	<DiffModal
		onClose={() => (showDiffModal = false)}
		{editedData}
		onSubmit={confirmSubmit}
	/>
{/if}

<style src="./style.scss"></style>

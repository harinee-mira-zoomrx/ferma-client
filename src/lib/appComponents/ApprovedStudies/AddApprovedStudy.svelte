<script>
	import Selectbox from '@components/Selectbox/Selectbox.svelte';
	import Input from '@components/Input/Input.svelte';
	import Textarea from '@components/Textarea/Textarea.svelte';
	import LinkList from '@components/LinkList/LinkList.svelte';
	import SegmentPill from '@components/SegmentPill/SegmentPill.svelte';
	import Button from '@components/Button/Button.svelte';
	import ReviewDesignation from './ReviewDesignation.svelte';
	import { loader } from '@components/Loader/Loader';
	import { toasts } from '@components/Toast/toasts';
	import { VERIFICATION_STATUS } from '@utils/constants';
	import { ROOT_LABELS } from '@models/roots';
	import { fetchRelationships, RELATIONSHIPS } from '@models/relationships';
	import { createApprovedStudy, GEOGRAPHIES } from '@models/studies';
	import {
		transformSnakeToCapitalized,
		validateURL,
		queryConstructor,
		debounce,
	} from '@utils/utility';
	import isEmpty from '@utils/is-empty';
	import { push } from 'svelte-spa-router';
	import RootSelectPill from '@appComponents/RootSelectPill/RootSelectPill.svelte';

	let formData = {
		organization: [],
		brand: null,
		active_ingredient: null,
		drug_combination_regimen: null,
		drug_class: [],
		target: [],
		indication: '',
		disease: [],
		study_date: null,
		geography: null,
		review_designations: [],
		source_url: null,
		verification_status: null,
		comment: null,
	};

	let activeIngredient = [];
	let drugCombination = [];
	let drugClasses = [];
	let targets = [];
	let therapyArea = [];
	let refreshDependentFields = 1;

	const resetDrugRelatedArrays = () => {
		activeIngredient = [];
		drugCombination = [];
		drugClasses = [];
		targets = [];
	};

	const onBrandChange = async () => {
		try {
			let queryParam = [
				{
					key: 'child_root_id',
					operator: '==',
					value: formData.brand.value,
				},
				{
					key: 'relationship',
					operator: 'in',
					value: [
						RELATIONSHIPS.ACTIVE_INGREDIENT_BRAND_MAPPING,
						RELATIONSHIPS.DRUG_COMBINATION_REGIMEN_BRAND_MAPPING,
					].join(':'),
				},
			];
			const [relationshipData] = await fetchRelationships({
				page: 1,
				size: 50,
				query: queryConstructor(queryParam),
			});

			resetDrugRelatedArrays();

			if (!relationshipData.length) return;

			let relationshipDetail = relationshipData[0];
			if (
				relationshipDetail.relationship ===
				RELATIONSHIPS.ACTIVE_INGREDIENT_BRAND_MAPPING
			) {
				activeIngredient = [
					{
						id: relationshipDetail.parent_root_id,
						name: relationshipDetail.parent_root_name,
					},
				];
				formData.active_ingredient = null;
				formData.drug_combination_regimen = null;
				refreshDependentFields++;

				onActiveIngredientChange(activeIngredient[0].id);
			} else if (
				relationshipDetail.relationship ===
				RELATIONSHIPS.DRUG_COMBINATION_REGIMEN_BRAND_MAPPING
			) {
				drugCombination = [
					{
						id: relationshipDetail.parent_root_id,
						name: relationshipDetail.parent_root_name,
					},
				];
				formData.active_ingredient = null;
				formData.drug_combination_regimen = null;
				formData.drug_class = [];
				formData.target = [];
				refreshDependentFields++;
			}
		} catch (error) {
			console.error(
				'Error fetching active ingredient and drug combination regimen',
				error
			);
			toasts.error(
				'Failed to fetch active ingredient and drug combination regimen.'
			);
			resetDrugRelatedArrays();
		}
	};

	const onActiveIngredientChange = async (id) => {
		try {
			let queryParam = [
				{ key: 'parent_root_id', operator: '==', value: id },
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
			console.error('Error fetching drug class and target:', error);
			toasts.error('Failed to fetch drug class and target.');
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

	const debouncedOnBrandChange = debounce(onBrandChange, 400);
	const debouncedOnActiveIngredientChange = debounce(() => {
		onActiveIngredientChange(formData.active_ingredient.value);
	}, 400);
	const debouncedOnDiseaseChange = debounce(onDiseaseChange, 400);

	const buildPayload = (formData) => {
		const keyMap = {
			organization: 'company_root_ids',
			brand: 'brand_root_id',
			active_ingredient: 'active_ingredient_root_id',
			drug_combination_regimen: 'drug_combination_regimen_root_id',
			drug_class: 'drug_class_root_ids',
			target: 'target_root_ids',
			disease: 'disease_root_ids',
			verification_status: 'verification_status',
			geography: 'geography',
			source_url: 'source',
		};

		const payload = {};

		for (const [fieldName, fieldValue] of Object.entries(formData)) {
			if (keyMap[fieldName]) {
				const mappedKey = keyMap[fieldName];
				if (Array.isArray(fieldValue)) {
					payload[mappedKey] = isEmpty(fieldValue)
						? null
						: fieldValue.map((item) => item.value);
				} else if (typeof fieldValue === 'string') {
					payload[mappedKey] = fieldValue;
				} else if (typeof fieldValue === 'object') {
					payload[mappedKey] = isEmpty(fieldValue)
						? null
						: fieldValue.value;
				}
			} else {
				payload[fieldName] = isEmpty(fieldValue) ? null : fieldValue;
			}
		}

		if (!isEmpty(formData.brand)) {
			if (
				isEmpty(formData.active_ingredient) &&
				!isEmpty(activeIngredient)
			) {
				payload['active_ingredient_root_id'] = activeIngredient[0].id;
			}
			if (
				isEmpty(formData.drug_combination_regimen) &&
				!isEmpty(drugCombination)
			) {
				payload['drug_combination_regimen_root_id'] =
					drugCombination[0].id;
			}
		}

		return payload;
	};

	const confirmSubmit = async () => {
		if (
			isEmpty(activeIngredient) &&
			isEmpty(drugCombination) &&
			isEmpty(formData.active_ingredient) &&
			isEmpty(formData.drug_combination_regimen)
		) {
			toasts.warn(
				'At least one of Active Ingredient or Drug Combination / Regimen fields must be filled'
			);
			return;
		}

		if (!validateURL(formData.source_url)) {
			toasts.warn('Please provide a valid source url.');
			return;
		}

		let payload = buildPayload(formData);
		loader.show();
		try {
			await createApprovedStudy(payload);
			toasts.success('Study created successfully');
			push(`/approved-studies`);
		} catch (error) {
			toasts.error(error.message || 'Error creating study');
		} finally {
			loader.hide();
		}
	};
</script>

<form on:submit|preventDefault={confirmSubmit} class="form">
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
			name="brand"
			label="Brand"
			bind:value={formData.brand}
			rootLabel={ROOT_LABELS.BRAND}
			onSelect={(event) => {
				resetDrugRelatedArrays();

				if (formData.brand) {
					debouncedOnBrandChange();
				}
			}}
			allowCreate={true}
			required={true}
		/>
	</div>
	{#if !isEmpty(activeIngredient)}
		<div class="form__element">
			<LinkList
				label="Active Ingredient"
				items={activeIngredient}
				getHref={(item) => `#/roots/${item.id}`}
			/>
		</div>
	{:else}
		{#key refreshDependentFields}
			<div class="form__element">
				<RootSelectPill
					name="active_ingredient"
					label="Active Ingredient"
					bind:value={formData.active_ingredient}
					rootLabel={ROOT_LABELS.ACTIVE_INGREDIENT}
					onSelect={(event) => {
						drugClasses = [];
						targets = [];
						if (formData.active_ingredient) {
							debouncedOnActiveIngredientChange();
						}
					}}
					allowCreate={true}
					disabled={!isEmpty(formData.drug_combination_regimen) ||
						!isEmpty(drugCombination)}
				/>
			</div>
		{/key}
	{/if}
	{#if !isEmpty(drugCombination)}
		<div class="form__element">
			<LinkList
				label="Drug Combination / Regimen"
				items={drugCombination}
				getHref={(item) => `#/roots/${item.id}`}
			/>
		</div>
	{:else}
		{#key refreshDependentFields}
			<div class="form__element">
				<RootSelectPill
					name="drug_combination_regimen"
					label="Drug Combination / Regimen"
					bind:value={formData.drug_combination_regimen}
					rootLabel={ROOT_LABELS.DRUG_COMBINATION_REGIMEN}
					allowCreate={true}
					disabled={!isEmpty(activeIngredient) ||
						!isEmpty(formData.active_ingredient) ||
						!isEmpty(formData.drug_class) ||
						!isEmpty(formData.target)}
				/>
			</div>
		{/key}
	{/if}
	{#if !isEmpty(formData.active_ingredient) || !isEmpty(activeIngredient)}
		<div class="form__element">
			<LinkList
				label={`Drug Classes mapped for ${(activeIngredient?.length && activeIngredient[0].name) || formData.active_ingredient.label}`}
				items={drugClasses}
				getHref={(item) => `#/roots/${item.id}`}
			/>
		</div>
	{/if}
	{#key refreshDependentFields}
		<div class="form__element">
			<RootSelectPill
				name="drug_class"
				label="Drug Class"
				bind:value={formData.drug_class}
				rootLabel={ROOT_LABELS.DRUG_CLASS}
				allowCreate={true}
				disabled={!isEmpty(formData.drug_combination_regimen) ||
					!isEmpty(drugCombination)}
				multiple={true}
			/>
		</div>
	{/key}
	{#if !isEmpty(formData.active_ingredient) || !isEmpty(activeIngredient)}
		<div class="form__element">
			<LinkList
				label={`Targets mapped for  ${(activeIngredient?.length && activeIngredient[0].name) || formData.active_ingredient.label}`}
				items={targets}
				getHref={(item) => `#/roots/${item.id}`}
			/>
		</div>
	{/if}
	{#key refreshDependentFields}
		<div class="form__element">
			<RootSelectPill
				name="targets"
				label="Target"
				bind:value={formData.target}
				rootLabel={ROOT_LABELS.TARGET}
				allowCreate={true}
				disabled={!isEmpty(formData.drug_combination_regimen) ||
					!isEmpty(drugCombination)}
				multiple={true}
			/>
		</div>
	{/key}
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
		<ReviewDesignation bind:value={formData.review_designations} />
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
		<Button type="primary" buttonType="submit">Save</Button>
	</div>
</form>

<style src="./style.scss"></style>

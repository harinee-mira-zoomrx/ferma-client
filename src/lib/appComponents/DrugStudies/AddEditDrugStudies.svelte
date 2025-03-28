<script>
	import DynamicForm from '@components/DynamicForm/DynamicForm.svelte';
	import { loader } from '@components/Loader/Loader';
	import Modal from '@components/Modal/Modal.svelte';
	import { toasts } from '@components/Toast/toasts';
	import { createDrugStudy, updateDrugStudy } from '@models/drugStudies';
	import {
		fetchSelectRootsSynonymsByLabel,
		ROOT_LABELS,
	} from '@models/roots';
	import {
		COMPONENT_TYPES,
		DRUG_TYPE,
		VERIFICATION_STATUS,
	} from '@utils/constants';
	import isEmpty from '@utils/is-empty';
	import { transformSnakeToCapitalized } from '@utils/utility';

	export let onClose;
	export let drugStudy;
	export let trial = null;
	export let isViewOnly = false;
	export let refreshDatatable = () => {};

	let pendingFormData = null;
	let drugStudyInput = {
		nct_id: drugStudy?.nct_id,
		drug_name: drugStudy?.drug_name,
		drug_root_id: drugStudy?.drug_root_id,
		drug_type: drugStudy?.drug_type,
		verification_status: drugStudy?.verification_status,
		comment: drugStudy?.comment,
	};
	let config = [
		{
			type: COMPONENT_TYPES.TEXTBOX,
			props: {
				label: 'NCT Id',
				// @ts-ignore
				value: trial?.nct_id || drugStudyInput?.nct_id,
			},
		},
		{
			type: COMPONENT_TYPES.ROOT_SELECT_BOX,
			props: {
				name: 'drug_root_id',
				label: 'Drug',
				placeholder: 'Select Drug',
				loadOptions: fetchSelectRootsSynonymsByLabel([
					'Active Ingredient',
					'Drug Class',
					'Target',
					'Brand',
					'Drug Combination/Regimen',
				]),
				value: drugStudyInput?.drug_root_id && {
					label: drugStudyInput?.drug_name,
					value: drugStudyInput?.drug_root_id,
				},
				disabled: isViewOnly,
				createLabelType: [
					ROOT_LABELS.ACTIVE_INGREDIENT,
					ROOT_LABELS.DRUG_CLASS,
					ROOT_LABELS.TARGET,
					ROOT_LABELS.BRAND,
					ROOT_LABELS.DRUG_COMBINATION_REGIMEN,
				],
				allowCreate: true,
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.SEGMENT_PILL,
			props: {
				name: 'drug_type',
				label: 'Drug Type',
				items: Object.values(DRUG_TYPE),
				value: drugStudyInput?.drug_type,
				disabled: isViewOnly,
				required: true,
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
				// placeholder: 'Select Verification Status',
				value: drugStudyInput?.verification_status,
				disabled: isViewOnly,
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				label: 'Comment',
				placeholder: 'Enter a comment',
				value: drugStudyInput?.comment,
				name: 'comment',
			},
		},
		{
			type: COMPONENT_TYPES.BUTTON,
			props: [
				{
					name: 'Save',
					type: 'primary',
					buttonType: 'submit',
				},
			],
		},
	];
	if (isViewOnly) {
		config.length = config.length - 1;
		config = config;
	}
	async function onUpdateDrugStudy(e) {
		try {
			loader.show();
			Object.keys(e.detail).forEach((key) => {
				if (drugStudyInput.hasOwnProperty(key)) {
					drugStudyInput[key] = e.detail[key];
				}
			});

			let formData = {
				...e.detail,
			};

			if (!isEmpty(pendingFormData)) {
				formData = { ...pendingFormData, ...formData };
			}
			pendingFormData = formData;
			const { verification_status, comment } = drugStudyInput;
			if (
				verification_status === VERIFICATION_STATUS.ESCALATED &&
				isEmpty(comment)
			) {
				toasts.error(
					'Comment cannot be empty when status is Escalated.'
				);
				return;
			}
			await updateDrugStudy(drugStudy.id, formData);
			pendingFormData = null;
			await refreshDatatable();
			toasts.success('Drug study updated successfully');
			onClose();
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	}
	async function addDrugStudy(e) {
		try {
			loader.show();
			Object.keys(e.detail).forEach((key) => {
				if (drugStudyInput.hasOwnProperty(key)) {
					drugStudyInput[key] = e.detail[key];
				}
			});

			let formData = {
				...e.detail,
			};

			if (!isEmpty(pendingFormData)) {
				formData = { ...pendingFormData, ...formData };
			}
			pendingFormData = formData;
			const { verification_status, comment } = drugStudyInput;
			if (
				verification_status === VERIFICATION_STATUS.ESCALATED &&
				isEmpty(comment)
			) {
				toasts.error(
					'Comment cannot be empty when status is Escalated.'
				);
				return;
			}
			await createDrugStudy({
				...formData,
				study_id: trial?.study_id,
			});
			pendingFormData = null;
			await refreshDatatable();
			toasts.success('Drug study created successfully');
			onClose();
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	}
	function onSubmit(e) {
		const drug = e.detail.hasOwnProperty('drug_root_id')
			? e.detail.drug_root_id
			: drugStudy?.drug_root_id;

		// if (
		// 	trial.study_type === 'Clinical' &&
		// 	[activeIngredient, brand, drugClass, target, drug_combination_regimen].filter((val) => val)
		// 		.length !== 1
		// ) {
		// 	toasts.warn(
		// 		'Ensure there is at least one, but no more than one, of: active ingredient, brand, drug class, target, or drug_combination_regimen.'
		// 	);
		// 	return;
		// }
		if (drugStudy) {
			onUpdateDrugStudy(e);
		} else {
			addDrugStudy(e);
		}
	}
</script>

<Modal
	title={(drugStudy ? (isViewOnly ? 'View' : 'Edit') : 'Add') + ' Drug Study'}
	showModal={true}
	{onClose}
>
	<svelte:fragment slot="modal-header-actions">
		<slot />
	</svelte:fragment>
	<svelte:fragment slot="content">
		<DynamicForm
			{config}
			columns={2}
			showEditedValues={!!drugStudy}
			on:submit={onSubmit}
		/>
	</svelte:fragment>
</Modal>

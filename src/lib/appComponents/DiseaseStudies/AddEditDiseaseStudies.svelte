<script>
	import DynamicForm from '@components/DynamicForm/DynamicForm.svelte';
	import { loader } from '@components/Loader/Loader';
	import Modal from '@components/Modal/Modal.svelte';
	import { toasts } from '@components/Toast/toasts';
	import {
		createDiseaseStudy,
		updateDiseaseStudy,
	} from '@models/diseaseStudies';
	import {
		fetchSelectRootsSynonymsByLabel,
		ROOT_LABELS,
	} from '@models/roots';
	import { COMPONENT_TYPES, VERIFICATION_STATUS } from '@utils/constants';
	import { validateJSON } from '@utils/utility';
	import isEmpty from '@utils/is-empty';
	import { transformSnakeToCapitalized } from '@utils/utility';

	export let onClose;
	export let diseaseStudy;
	export let trial = null;
	export let isViewOnly = false;
	export let refreshDatatable = () => {};

	let pendingFormData = null;
	let diseaseStudyInput = {
		nct_id: diseaseStudy?.nct_id,
		disease_root_id: diseaseStudy?.disease_root_id,
		disease_name: diseaseStudy?.disease_name,
		indication: diseaseStudy?.indication,
		date: diseaseStudy?.date,
		review_designations: diseaseStudy?.review_designations,
		verification_status: diseaseStudy?.verification_status,
		comment: diseaseStudy?.comment,
	};

	let config = [
		{
			type: COMPONENT_TYPES.TEXTBOX,
			props: {
				label: 'NCT Id',
				// @ts-ignore
				value: trial?.nct_id || diseaseStudyInput?.nct_id,
			},
		},
		{
			type: COMPONENT_TYPES.ROOT_SELECT_BOX,
			props: {
				name: 'disease_root_id',
				label: 'Disease',
				placeholder: 'Select Disease',
				value: diseaseStudyInput?.disease_root_id && {
					label: diseaseStudyInput?.disease_name,
					value: diseaseStudyInput?.disease_root_id,
				},
				loadOptions: fetchSelectRootsSynonymsByLabel('Disease'),
				disabled: isViewOnly,
				createLabelType: ROOT_LABELS.DISEASE,
				allowCreate: true,
			},
		},
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				name: 'indication',
				label: 'Indication',
				placeholder: 'Enter Indication',
				width: '100%',
				value: diseaseStudyInput?.indication,
				disabled: isViewOnly,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'date',
				type: 'date',
				disabled: isViewOnly,
				value: diseaseStudyInput?.date,
				label: 'Approval Date',
			},
		},
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				name: 'review_designations',
				label: 'Review Designations(JSON)',
				placeholder: 'Enter Review Designations as JSON',
				width: '100%',
				disabled: isViewOnly,
				value: diseaseStudyInput?.review_designations,
			},
			validation: (json) => {
				if (json === null || validateJSON(json)) return true;
				toasts.warn(
					'Please provide a valid review designations as JSON'
				);
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
				value: diseaseStudyInput?.verification_status,
				required: true,
				disabled: isViewOnly,
			},
		},
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				label: 'Comment',
				placeholder: 'Enter a comment',
				value: diseaseStudyInput?.comment,
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
	async function onUpdateDiseaseStudy(e) {
		try {
			loader.show();
			Object.keys(e.detail).forEach((key) => {
				if (diseaseStudyInput.hasOwnProperty(key)) {
					diseaseStudyInput[key] = e.detail[key];
				}
			});

			let formData = {
				...e.detail,
			};

			if (!isEmpty(pendingFormData)) {
				formData = { ...pendingFormData, ...formData };
			}
			pendingFormData = formData;
			const { verification_status, comment } = diseaseStudyInput;
			if (
				verification_status === VERIFICATION_STATUS.ESCALATED &&
				isEmpty(comment)
			) {
				toasts.error(
					'Comment cannot be empty when status is Escalated.'
				);
				return;
			}
			await updateDiseaseStudy(diseaseStudy.id, formData);
			pendingFormData = null;
			await refreshDatatable();
			toasts.success('Disease study updated successfully');
			onClose();
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	}
	async function addDiseaseStudy(e) {
		try {
			loader.show();
			Object.keys(e.detail).forEach((key) => {
				if (diseaseStudyInput.hasOwnProperty(key)) {
					diseaseStudyInput[key] = e.detail[key];
				}
			});

			let formData = {
				...e.detail,
			};

			if (!isEmpty(pendingFormData)) {
				formData = { ...pendingFormData, ...formData };
			}
			pendingFormData = formData;
			const { verification_status, comment } = formData;
			if (
				verification_status === VERIFICATION_STATUS.ESCALATED &&
				isEmpty(comment)
			) {
				toasts.error(
					'Comment cannot be empty when status is Escalated.'
				);
				return;
			}
			await createDiseaseStudy({
				...formData,
				study_id: trial?.study_id,
			});
			pendingFormData = null;
			await refreshDatatable();
			toasts.success('Disease study created successfully');
			onClose();
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	}
	function onSubmit(e) {
		const indication = e.detail.hasOwnProperty('indication')
			? e.detail.indication
			: diseaseStudy?.indication;

		const disease = e.detail.hasOwnProperty('disease_root_id')
			? e.detail.disease_root_id
			: diseaseStudy?.disease_root_id;

		if (!(indication || disease)) {
			toasts.warn(
				'At-least either one of indication or disease should be present.'
			);
			return false;
		}
		if (diseaseStudy) {
			onUpdateDiseaseStudy(e);
		} else {
			addDiseaseStudy(e);
		}
	}
</script>

<Modal
	title={(diseaseStudy ? (isViewOnly ? 'View' : 'Edit') : 'Add') +
		' Disease Study'}
	showModal={true}
	{onClose}
>
	<svelte:fragment slot="modal-header-actions">
		<slot />
	</svelte:fragment>
	<svelte:fragment slot="content">
		<DynamicForm
			{config}
			columns={3}
			showEditedValues={!!diseaseStudy}
			fullWidth={true}
			on:submit={onSubmit}
		/>
	</svelte:fragment>
</Modal>

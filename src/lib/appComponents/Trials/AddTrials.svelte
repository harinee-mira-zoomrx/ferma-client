<script>
	import DynamicForm from '@components/DynamicForm/DynamicForm.svelte';
	import { loader } from '@components/Loader/Loader';
	import Modal from '@components/Modal/Modal.svelte';
	import { toasts } from '@components/Toast/toasts';
	import { TRIAL_PHASES, TRIAL_STATUS, createTrials } from '@models/trials';
	import { COMPONENT_TYPES, VERIFICATION_STATUS } from '@utils/constants';
	import { validateURL } from '@utils/utility';
	import {
		fetchSelectRootsSynonymsByLabel,
		ROOT_LABELS,
	} from '@models/roots';
	import { transformSnakeToCapitalized } from '@utils/utility';
	import { STUDY_TYPE } from '@models/studies';

	export let onClose;
	export let refreshData = () => {};
	let selectedVerificationStatus = '';
	$: config = [
		{
			type: COMPONENT_TYPES.TEXTBOX,
			props: {
				label: 'Study Type',
				value: STUDY_TYPE.CLINICAL,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'nct_id',
				label: 'NCT Id',
				placeholder: 'Enter NCT Id',
				required: true,
			},
			validation: (nctId) => {
				if (/^NCT\d{8}$/.test(nctId)) {
					return true;
				}
				toasts.warn('Please provide a valid NCT Id.');
			},
		},
		{
			type: COMPONENT_TYPES.SELECT_BOX,
			props: {
				name: 'phases',
				items: Object.values(TRIAL_PHASES),
				clearFilterTextOnBlur: true,
				label: 'Phases',
				placeholder: 'Select phase',
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'acronym',
				label: 'Acronym',
				placeholder: 'Enter acronym',
			},
		},
		{
			type: COMPONENT_TYPES.ROOT_SELECT_BOX,
			props: {
				name: 'acronym_root_id',
				label: 'Trial Acronym',
				placeholder: 'Select Trial Acronym',
				loadOptions: fetchSelectRootsSynonymsByLabel('Trial Acronym'),
				createLabelType: ROOT_LABELS.TRIAL_ACRONYM,
				allowCreate: true,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'study_start_date',
				label: 'Study Start Date',
				placeholder: 'Enter study start date',
				type: 'date',
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'study_completion_date',
				label: 'Study Completion Date',
				placeholder: 'Enter study completion date',
				type: 'date',
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'primary_completion_date',
				label: 'Primary Completion Date',
				placeholder: 'Enter primary completion date',
				type: 'date',
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'study_url',
				label: 'Study URL',
				placeholder: 'Enter study url',
				required: true,
			},
			validation: (url) => {
				if (validateURL(url)) return true;
				toasts.warn('Please provide a valid study url.');
				return false;
			},
		},
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				name: 'brief_title',
				label: 'Brief Title',
				placeholder: 'Enter brief title',
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				name: 'official_title',
				label: 'Official Title',
				placeholder: 'Enter official title',
			},
		},

		{
			type: COMPONENT_TYPES.SELECT_BOX,
			props: {
				name: 'overall_status',
				items: Object.values(TRIAL_STATUS),
				clearFilterTextOnBlur: true,
				label: 'Overall Status',
				placeholder: 'Select overall status',
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
				required: true,
				onClickHandler: (e) => (selectedVerificationStatus = e.value),
			},
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
			props: [
				{
					name: 'Save',
					type: 'primary',
					buttonType: 'submit',
				},
			],
		},
	];
	async function addTrial(e) {
		try {
			const data = e.detail;
			data.study_type = 'Clinical';
			loader.show();
			await createTrials(data);
			await refreshData();
			toasts.success('Trial created successfully');
			onClose();
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	}
</script>

<Modal title="Add Clinical Trials" showModal={true} {onClose}>
	<svelte:fragment slot="content">
		<DynamicForm {config} columns={3} on:submit={addTrial} />
	</svelte:fragment>
</Modal>

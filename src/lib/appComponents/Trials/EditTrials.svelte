<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import DynamicForm from '@components/DynamicForm/DynamicForm.svelte';
	import { loader } from '@components/Loader/Loader';
	import { toasts } from '@components/Toast/toasts';
	import {
		TRIAL_PHASES,
		TRIAL_STATUS,
		updateTrials,
		fetchTrial,
	} from '@models/trials';
	import { COMPONENT_TYPES, VERIFICATION_STATUS } from '@utils/constants';
	import {
		fetchSelectRootsSynonymsByLabel,
		ROOT_LABELS,
	} from '@models/roots';
	import { transformSnakeToCapitalized } from '@utils/utility';
	import isEmpty from '@utils/is-empty';
	import { push } from 'svelte-spa-router';

	export let nctId;

	const dispatch = createEventDispatcher();
	let trial = {
		study_type: '',
		nct_id: '',
		phases: '',
		acronym: '',
		acronym_name: '',
		acronym_root_id: '',
		study_start_date: '',
		study_completion_date: '',
		primary_completion_date: '',
		study_url: '',
		brief_title: '',
		official_title: '',
		overall_status: '',
		study_is_valid: '',
		verification_status: '',
		comment: '',
	};

	$: trialInputValue = {
		...trial,
	};

	let pendingFormData = null;

	$: config = [
		{
			type: COMPONENT_TYPES.TEXTBOX,
			props: {
				label: 'Study Type',
				value: trialInputValue?.study_type,
			},
		},
		{
			type: COMPONENT_TYPES.TEXTBOX,
			props: {
				label: 'NCT Id',
				value: trialInputValue?.nct_id,
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
				value: trialInputValue?.phases,
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'acronym',
				label: 'Acronym',
				placeholder: 'Enter acronym',
				value: trialInputValue?.acronym,
			},
		},
		{
			type: COMPONENT_TYPES.ROOT_SELECT_BOX,
			props: {
				name: 'acronym_root_id',
				label: 'Trial Acronym',
				placeholder: 'Select Trial Acronym',
				loadOptions: fetchSelectRootsSynonymsByLabel('Trial Acronym'),
				value: trialInputValue?.acronym_root_id && {
					label: trialInputValue?.acronym_name,
					value: trialInputValue?.acronym_root_id,
				},
				createLabelType: ROOT_LABELS.TRIAL_ACRONYM,
				allowCreate: true,
			},
		},
		{
			type: COMPONENT_TYPES.TEXTBOX,
			props: {
				// name: 'study_start_date',
				label: 'Study Start Date',
				// placeholder: 'Enter study start date',
				// type: 'date',
				value: trialInputValue?.study_start_date,
			},
		},
		{
			type: COMPONENT_TYPES.TEXTBOX,
			props: {
				// name: 'study_completion_date',
				label: 'Study Completion Date',
				// placeholder: 'Enter study completion date',
				// type: 'date',
				value: trialInputValue?.study_completion_date,
			},
		},
		{
			type: COMPONENT_TYPES.TEXTBOX,
			props: {
				// name: 'primary_completion_date',
				label: 'Primary Completion Date',
				// placeholder: 'Enter primary completion date',
				// type: 'date',
				value: trialInputValue?.primary_completion_date,
			},
		},
		{
			type: COMPONENT_TYPES.TEXTBOX,
			props: {
				// name: 'study_url',
				label: 'Study URL',
				// placeholder: 'Enter study url',
				// required: true,
				value: trialInputValue?.study_url,
			},
			// validation: (url) => {
			// 	if (['Unknown'].includes(url) || validateURL(url)) return true;
			// 	toasts.warn('Please provide a valid study url.');
			// 	return false;
			// },
		},
		{
			type: COMPONENT_TYPES.TEXTBOX,
			props: {
				// name: 'brief_title',
				label: 'Brief Title',
				// placeholder: 'Enter brief title',
				value: trialInputValue?.brief_title,
				// required: true,
			},
		},
		{
			type: COMPONENT_TYPES.TEXTBOX,
			props: {
				// name: 'official_title',
				label: 'Official Title',
				// placeholder: 'Enter official title',
				value: trialInputValue?.official_title,
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
				value: trialInputValue?.overall_status,
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.TEXTBOX,
			props: {
				label: 'Valid Study',
				value: trialInputValue?.study_is_valid ? 'Valid' : 'Invalid',
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
				value: trialInputValue?.verification_status,
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				label: 'Comment',
				placeholder: 'Enter a comment',
				value: trialInputValue?.comment,
				name: 'comment',
			},
		},
		{
			type: COMPONENT_TYPES.BUTTON,
			props: [
				// {
				// 	name: 'Delete',
				// 	type: 'secondary',
				// 	onClick: onDeleteHandler,
				// },
				{
					name: 'Save',
					type: 'primary',
					buttonType: 'submit',
				},
			],
		},
	];
	// async function onDeleteHandler() {
	// 	try {
	// 		await deleteTrials(trial.nct_id);
	// 		dispatch('resetData');
	// 		toasts.pushToast('Trial del successfully');
	// 	} catch (error) {
	// 		toasts.pushToast(error);
	// 	}
	// }
	async function onUpdateHandler(e) {
		try {
			loader.show();
			Object.keys(e.detail).forEach((key) => {
				if (trialInputValue.hasOwnProperty(key)) {
					trialInputValue[key] = e.detail[key];
				}
			});

			let formData = {
				...e.detail,
			};

			if (!isEmpty(pendingFormData)) {
				formData = { ...pendingFormData, ...formData };
			}
			pendingFormData = formData;
			const { verification_status, comment } = trialInputValue;
			if (
				verification_status === VERIFICATION_STATUS.ESCALATED &&
				isEmpty(comment)
			) {
				toasts.error(
					'Comment cannot be empty when status is Escalated.'
				);
				return;
			}
			await updateTrials(nctId, formData);
			dispatch('TrialDetailChange', { ...trialInputValue });
			dispatch('EscalateOverallStatus', {
				trials:
					trialInputValue.verification_status ===
					VERIFICATION_STATUS.ESCALATED,
			});
			dispatch('RefreshAuditLog');
			pendingFormData = null;
			toasts.success('Trial updated successfully');
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	}

	const fetchdata = async () => {
		try {
			loader.show();
			let queryParams = { overall_status: true };
			const response = await fetchTrial(nctId, queryParams);
			trial = response?.data || {};
			let meta = response?.meta || {};
			dispatch('TrialDetailChange', { ...trial });
			dispatch('EscalateOverallStatus', {
				trials:
					trial.verification_status === VERIFICATION_STATUS.ESCALATED,
				diseases_studies: meta.escalated_disease_studies,
				drugs_studies: meta.escalated_drug_studies,
				organizations_studies: meta.escalated_organization_studies,
				readout_studies: meta.escalated_readout_studies,
			});
		} catch (error) {
			toasts.error(error);
			push('/trials');
		} finally {
			loader.hide();
		}
	};

	onMount(() => {
		fetchdata();
	});
</script>

<div class="header">Trial</div>
<DynamicForm
	{config}
	showEditedValues={true}
	columns={3}
	on:submit={onUpdateHandler}
/>

<style lang="scss">
	.header {
		font-size: 20px;
		margin-bottom: 15px;
	}
</style>

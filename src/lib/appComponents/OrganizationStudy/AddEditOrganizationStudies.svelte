<script>
	import DynamicForm from '@components/DynamicForm/DynamicForm.svelte';
	import { loader } from '@components/Loader/Loader';
	import Modal from '@components/Modal/Modal.svelte';
	import { toasts } from '@components/Toast/toasts';
	import {
		ORGANIZATION_ROLE,
		createOrganizationStudy,
		updateOrganizationStudy,
	} from '@models/organizationStudies';
	import {
		fetchSelectRootsSynonymsByLabel,
		ROOT_LABELS,
	} from '@models/roots';
	import { COMPONENT_TYPES, VERIFICATION_STATUS } from '@utils/constants';
	import isEmpty from '@utils/is-empty';
	import { transformSnakeToCapitalized } from '@utils/utility';

	export let onClose;
	export let trial = null;
	export let organizationStudy;
	export let refreshDatatable = () => {};

	let pendingFormData = null;
	let organizationStudyInput = {
		nct_id: organizationStudy?.nct_id,
		organization_root_id: organizationStudy?.organization_root_id,
		organization_name: organizationStudy?.organization_name,
		organization_role: organizationStudy?.organization_role,
		verification_status: organizationStudy?.verification_status,
		comment: organizationStudy?.comment,
	};

	let config = [
		{
			type: COMPONENT_TYPES.TEXTBOX,
			props: {
				label: 'NCT Id',
				// @ts-ignore
				value: trial?.nct_id || organizationStudyInput?.nct_id,
			},
		},
		{
			type: COMPONENT_TYPES.ROOT_SELECT_BOX,
			props: {
				name: 'organization_root_id',
				label: 'Organization',
				placeholder: 'Select Organization',
				value: organizationStudyInput?.organization_root_id && {
					label: organizationStudyInput?.organization_name,
					value: organizationStudyInput?.organization_root_id,
				},
				loadOptions: fetchSelectRootsSynonymsByLabel('Organization'),
				required: true,
				createLabelType: ROOT_LABELS.ORGANIZATION,
				allowCreate: true,
			},
		},
		{
			type: COMPONENT_TYPES.SELECT_BOX,
			props: {
				name: 'organization_role',
				label: 'Organization Role',
				placeholder: 'Select Organization Role',
				items: Object.values(ORGANIZATION_ROLE),
				clearFilterTextOnBlur: true,
				value: organizationStudyInput?.organization_role,
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
				value: organizationStudyInput?.verification_status,
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				label: 'Comment',
				placeholder: 'Enter a comment',
				value: organizationStudyInput?.comment,
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
	async function onUpdateOrganizationStudy(e) {
		try {
			loader.show();
			Object.keys(e.detail).forEach((key) => {
				if (organizationStudyInput.hasOwnProperty(key)) {
					organizationStudyInput[key] = e.detail[key];
				}
			});

			let formData = {
				...e.detail,
			};

			if (!isEmpty(pendingFormData)) {
				formData = { ...pendingFormData, ...formData };
			}
			pendingFormData = formData;
			const { verification_status, comment } = organizationStudyInput;
			if (
				verification_status === VERIFICATION_STATUS.ESCALATED &&
				isEmpty(comment)
			) {
				toasts.error(
					'Comment cannot be empty when status is Escalated.'
				);
				return;
			}
			await updateOrganizationStudy(organizationStudy.id, formData);
			pendingFormData = null;
			await refreshDatatable();
			toasts.success('Organization study updated successfully');
			onClose();
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	}
	async function addOrganizationStudy(e) {
		try {
			loader.show();
			Object.keys(e.detail).forEach((key) => {
				if (organizationStudyInput.hasOwnProperty(key)) {
					organizationStudyInput[key] = e.detail[key];
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
			await createOrganizationStudy({
				...formData,
				study_id: trial?.study_id,
			});
			pendingFormData = null;
			await refreshDatatable();
			toasts.success('Organization study created successfully');
			onClose();
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	}
	function onSubmit(e) {
		if (organizationStudy) {
			onUpdateOrganizationStudy(e);
		} else {
			addOrganizationStudy(e);
		}
	}
</script>

<Modal
	title={(organizationStudy ? 'Edit' : 'Add') + ' Organization Study'}
	showModal={true}
	{onClose}
>
	<svelte:fragment slot="content">
		<DynamicForm
			{config}
			columns={1}
			showEditedValues={!!organizationStudy}
			on:submit={onSubmit}
		/>
	</svelte:fragment>
</Modal>

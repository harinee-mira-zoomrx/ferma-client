<script>
	import DynamicForm from '@components/DynamicForm/DynamicForm.svelte';
	import { loader } from '@components/Loader/Loader';
	import Modal from '@components/Modal/Modal.svelte';
	import { toasts } from '@components/Toast/toasts';
	import { createRoot } from '@models/roots';
	import { COMPONENT_TYPES } from '@utils/constants';
	import { VERIFICATION_STATUS } from '@utils/constants.js';
	import {
		fetchSelectRootsSynonymsByLabel,
		ROOT_LABELS,
	} from '@models/roots';
	import { transformSnakeToCapitalized } from '@utils/utility';
	import { authorization } from '@stores/authorization.store';

	export let onClose;
	export let onAdd;

	let isInvalidTerm = false;
	let selectedVerificationStatus = '';
	let selectedLabel;
	let { permissions } = $authorization;

	$: config = [
		{
			type: COMPONENT_TYPES.SELECT_BOX,
			props: {
				name: 'label',
				items: [
					...Object.values(ROOT_LABELS).map((label) => ({
						label: label,
						value: label,
					})),
				],
				label: 'Root Label',
				clearFilterTextOnBlur: true,
				placeholder: 'Enter root label',
				onChange: (e) => {
					selectedLabel = e.detail.label;
				},
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				label: 'Root name',
				placeholder: 'Enter root name',
				name: 'name',
				required: true,
				onInput: () => {
					isInvalidTerm = false;
				},
			},
		},
		{
			type: COMPONENT_TYPES.ROOT_SELECT_BOX,
			hide: selectedLabel !== ROOT_LABELS.DRUG_COMBINATION_REGIMEN,
			props: {
				name: 'drug_combination_regimen_hierarchy_root_ids',
				label: 'Roots for Drug Combination/Regimen Hierarchy',
				multiple: true,
				clearFilterTextOnBlur: true,
				placeholder: 'Select drugs',
				required: true,
				allowCreate: true,
				createLabelType: [
					ROOT_LABELS.ACTIVE_INGREDIENT,
					ROOT_LABELS.DRUG_CLASS,
					ROOT_LABELS.TARGET,
				],
				loadOptions: fetchSelectRootsSynonymsByLabel([
					ROOT_LABELS.ACTIVE_INGREDIENT,
					ROOT_LABELS.DRUG_CLASS,
					ROOT_LABELS.TARGET,
				]),
			},
		},
		{
			type: COMPONENT_TYPES.SEGMENT_PILL,
			props: {
				name: 'is_case_sensitive',
				label: 'Case Sensitive',
				items: [
					{
						label: 'False',
						value: false,
					},
					{
						label: 'True',
						value: true,
					},
				],
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.SEGMENT_PILL,
			props: {
				name: 'is_meta_data_verified',
				label: 'Meta Data Verified',
				items: [
					{
						label: 'False',
						value: false,
					},
					{
						label: 'True',
						value: true,
					},
				],
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
				required: true,
				infoMessage:
					'Verification Status of Root will automatically<br> apply to its generated synonyms',
				onClickHandler: (e) => (selectedVerificationStatus = e.value),
			},
		},
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				label: 'Comment',
				placeholder: 'Enter comment',
				name: 'comment',
				required:
					selectedVerificationStatus ===
					VERIFICATION_STATUS.ESCALATED,
			},
		},
		{
			type: COMPONENT_TYPES.ALERT,
			hide: !isInvalidTerm,
			props: {
				severity: 'warning',
				message: 'The root name is marked as invalid',
				checkBoxMessage: 'Confirm to add as new root.',
			},
		},
		{
			type: COMPONENT_TYPES.BUTTON,
			props: [
				{
					buttonType: 'submit',
					type: 'primary',
					name: 'Save',
				},
			],
		},
	];
	const onCreate = async (e) => {
		try {
			loader.show();
			let formData = {
				...e.detail,
			};
			if (isInvalidTerm) {
				formData.allow_invalid_term = true;
			}
			await createRoot(formData);
			toasts.success('Root created successfully.');
			onAdd();
			onClose();
		} catch (error) {
			if (error?.status === 422) {
				if (permissions.canInvalidateRoot) {
					isInvalidTerm = true;
					toasts.error('The root name is already marked as invalid.');
				} else {
					toasts.error('The root name is already marked as invalid.');
				}
			} else {
				toasts.error(error.message || 'An unexpected error occurred.');
			}
		} finally {
			loader.hide();
		}
	};
</script>

<Modal title="Add Roots" showModal={true} {onClose}>
	<svelte:fragment slot="content">
		<DynamicForm fullWidth={true} {config} on:submit={onCreate} />
	</svelte:fragment>
</Modal>

<script>
	import Modal from '@components/Modal/Modal.svelte';
	import {
		createRoot,
		fetchSelectRootsSynonymsByLabel,
		ROOT_LABELS,
	} from '@models/roots.js';
	import { toasts } from '@components/Toast/toasts.js';
	import { loader } from '@components/Loader/Loader.js';
	import { COMPONENT_TYPES, VERIFICATION_STATUS } from '@utils/constants.js';
	import { createEventDispatcher } from 'svelte';
	import DynamicForm from '@components/DynamicForm/DynamicForm.svelte';
	import { authorization } from '@stores/authorization.store';
	import isEmpty from '@utils/is-empty';

	export let rootData = {};
	export let showAddRootModal = false;
	export let onClose;

	const dispatch = createEventDispatcher();

	let selectedRootName = rootData?.createRootName || '';
	let selectedRootLabel = '';
	let isInvalidTerm = false;
	let { permissions } = $authorization;

	if (!isEmpty(rootData?.createLabelType)) {
		selectedRootLabel = Array.isArray(rootData.createLabelType)
			? rootData.createLabelType[0]
			: rootData.createLabelType;
	}

	$: config = [
		{
			type: COMPONENT_TYPES.SELECT_BOX,
			hide: !(
				Array.isArray(rootData?.createLabelType) &&
				rootData.createLabelType.length > 1
			),
			preserveUnchangedData: true,
			props: {
				name: 'label',
				label: 'Root Label',
				items: rootData.createLabelType,
				value: selectedRootLabel,
				placeholder: 'Enter root label',
				clearFilterTextOnBlur: true,
				onChange: (e) => {
					selectedRootLabel = e.value || e.detail.label;
				},
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.TEXTBOX,
			hide:
				Array.isArray(rootData?.createLabelType) &&
				rootData.createLabelType.length > 1,
			props: {
				name: 'label',
				label: 'Root Label',
				value: selectedRootLabel,
				required: true,
				disabled: true,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			preserveUnchangedData: true,
			props: {
				name: 'name',
				label: 'Root Name',
				placeholder: 'Enter root name',
				value: selectedRootName,
				required: true,
				onInput: () => {
					isInvalidTerm = false;
				},
			},
		},
		{
			type: COMPONENT_TYPES.ROOT_SELECT_BOX,
			hide: selectedRootLabel !== ROOT_LABELS.DRUG_COMBINATION_REGIMEN,
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

	const onSubmit = async (e) => {
		const data = e.detail;

		try {
			loader.show();

			let formData = {
				...data,
				verification_status: VERIFICATION_STATUS.NOT_VERIFIED,
			};

			if (isInvalidTerm) {
				formData.allow_invalid_term = true;
			}

			let response = await createRoot(formData);
			toasts.success('Root created successfully.');
			dispatch('add', {
				id: response.id,
				name: response.name,
				label: response.label,
			});
		} catch (error) {
			if (error?.status === 422) {
				if (permissions.canInvalidateRoot) {
					isInvalidTerm = true;
				}
				toasts.error('The root name is already marked as invalid.');
			} else {
				toasts.error(error.message || 'An unexpected error occurred.');
			}
		} finally {
			loader.hide();
			showAddRootModal = false;
		}
	};
</script>

<Modal title="Add Roots" showModal={true} {onClose}>
	<svelte:fragment slot="content">
		<DynamicForm fullWidth={true} {config} on:submit={onSubmit} />
	</svelte:fragment>
</Modal>

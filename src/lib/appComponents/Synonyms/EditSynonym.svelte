<script>
	import DynamicForm from '@components/DynamicForm/DynamicForm.svelte';
	import { loader } from '@components/Loader/Loader';
	import Modal from '@components/Modal/Modal.svelte';
	import { toasts } from '@components/Toast/toasts';
	import { updateSynonyms } from '@models/synonyms';
	import { COMPONENT_TYPES, VERIFICATION_STATUS } from '@utils/constants';
	import isEmpty from '@utils/is-empty';
	import { transformSnakeToCapitalized } from '@utils/utility';

	export let root;
	export let synonym;
	export let onClose;
	export let refreshDatatable = () => {};

	let synonymInputValue = {
		name: synonym.name,
		is_case_sensitive: synonym.is_case_sensitive,
		verification_status: synonym.verification_status,
		comment: synonym.comment || null,
		allow_invalid_term: false,
	}

	let isInvalidTerm = false;
	let pendingFormData = null;

	$: config = [
		{
			type: COMPONENT_TYPES.TEXTBOX,
			props: {
				label: 'Root Name',
				value: root.name,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				label: 'Synonym Name',
				placeholder: 'Enter synonym name',
				value: synonymInputValue.name,
				name: 'name',
				required: true,
				onInput: (e) => {
					isInvalidTerm = false;
				},
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
				value: ![null, undefined].includes(synonymInputValue?.is_case_sensitive)
					? {
							label: synonymInputValue.is_case_sensitive ? 'True' : 'False',
							value: synonymInputValue.is_case_sensitive,
						}
					: undefined,
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
				value: synonymInputValue.verification_status,
				required: true,
				infoMessage: "Verification Status of parent synonym will automatically<br> apply to its generated synonyms",
			},
		},
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				label: 'Comment',
				placeholder: 'Enter a comment',
				value: synonymInputValue.comment,
				name: 'comment',
			},
		},
		{
			type: COMPONENT_TYPES.ALERT,
			hide: !isInvalidTerm,
			props: {
				severity: 'warning',
				message: 'The synonym name is marked as invalid',
				checkBoxMessage: 'Confirm to add as new synonym.',
				value: synonymInputValue.allow_invalid_term,
				name: 'allow_invalid_term',
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
	async function onUpdateSynonym(e) {
		try {
			loader.show();
			Object.keys(e.detail).forEach(key => {
				if (synonymInputValue.hasOwnProperty(key)) {
					synonymInputValue[key] = e.detail[key];
				}
			});

			let formData = {
				...e.detail
			};

			if (!isEmpty(pendingFormData)) {
				formData = { ...pendingFormData, ...formData };
			}
			pendingFormData = formData;

			const { verification_status, comment } = synonymInputValue;
			if (
				verification_status === VERIFICATION_STATUS.ESCALATED &&
				isEmpty(comment)
			) {
				toasts.error(
					'Comment cannot be empty when status is Escalated.'
				);
				return;
			}

			await updateSynonyms(synonym.id, formData);
			await refreshDatatable();
			pendingFormData = null;
			isInvalidTerm = false;
			toasts.success('Synonym(s) updated successfully');
			onClose();
		} catch (error) {
			handleError(error);
		} finally {
			loader.hide();
		}
	}

	function handleError(error) {
		if (error?.status === 422) {
			isInvalidTerm = true;
		} else {
			toasts.error(error.message || 'An unexpected error occurred.');
		}
	}
</script>

<Modal title={'Edit Synonym'} showModal={true} {onClose}>
	<svelte:fragment slot="content">
		<DynamicForm
			{config}
			fullWidth={true}
			on:submit={onUpdateSynonym}
		/>
	</svelte:fragment>
</Modal>

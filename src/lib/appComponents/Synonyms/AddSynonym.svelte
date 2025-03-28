<script>
	import DynamicForm from '@components/DynamicForm/DynamicForm.svelte';
	import { loader } from '@components/Loader/Loader';
	import Modal from '@components/Modal/Modal.svelte';
	import { toasts } from '@components/Toast/toasts';
	import { createSynonyms } from '@models/synonyms';
	import { COMPONENT_TYPES, VERIFICATION_STATUS } from '@utils/constants';
	import { transformSnakeToCapitalized } from '@utils/utility';
	import { authorization } from '@stores/authorization.store';

	export let root;
	export let onClose;
	export let refreshDatatable = () => {};

	let isInvalidTerm = false;
	let selectedVerificationStatus = '';
	let { permissions } = $authorization;

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
				infoMessage: "Verification Status of parent synonym will automatically<br> apply to its generated synonyms",
				onClickHandler: (e) => (selectedVerificationStatus = e.value)
			},
		},
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				label: 'Comment',
				placeholder:
					'Enter comment',
				name: 'comment',
				required: selectedVerificationStatus === VERIFICATION_STATUS.ESCALATED,
			},
		},
		{
			type: COMPONENT_TYPES.ALERT,
			hide: !isInvalidTerm,
			props: {
				severity: 'warning',
				message: 'The synonym name is marked as invalid',
				checkBoxMessage: 'Confirm to add as new synonym.',
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
	async function addSynonym(e) {
		try {
			loader.show();

			let formData = {
				...e.detail,
			};

			if (isInvalidTerm) {
				formData.allow_invalid_term = true;
			}

			await createSynonyms({
				...formData,
				is_generated: false,
				root_id: root.id,
			});
			await refreshDatatable();
			toasts.success('Synonym created successfully');
			onClose();
		} catch (error) {
			handleError(error);
		} finally {
			loader.hide();
		}
	}

	function handleError(error) {
		if (error?.status === 422) {
			if (permissions.canInvalidateRoot) {
				isInvalidTerm = true;
				toasts.error(
					'The synonym is already marked as invalid.'
				);
			} else {
				toasts.error('The synonym is already marked as invalid.');
			}
		} else {
			toasts.error(error.message || 'An unexpected error occurred.');
		}
	}
</script>

<Modal
	title={'Add Synonym'}
	showModal={true}
	{onClose}
>
	<svelte:fragment slot="content">
		<DynamicForm
			fullWidth={true}
			{config}
			on:submit={addSynonym} />
	</svelte:fragment>
</Modal>
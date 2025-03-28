<script>
	import DynamicForm from '@components/DynamicForm/DynamicForm.svelte';
	import { loader } from '@components/Loader/Loader';
	import Modal from '@components/Modal/Modal.svelte';
	import { toasts } from '@components/Toast/toasts';
	import { COMPONENT_TYPES } from '@utils/constants';
	import { VERIFICATION_STATUS } from '@utils/constants.js';
	import { transformSnakeToCapitalized } from '@utils/utility';
	import isEmpty from '@utils/is-empty';
	import { updateRelationship } from '@models/relationships';

	export let root;
	export let relationship;
	export let onClose;
	export let refreshDatatable = (_) => {};

	let selectedVerificationStatus = '';
	let relationshipInputValue = {
		parent_root_name: relationship.parent_root_name,
		child_root_name: relationship.child_root_name,
		verification_status: relationship.verification_status,
		comment: relationship.comment,
	}
	let pendingFormData = null;

	const onEditRelationship = async (e) => {
		try {
			loader.show();
			Object.keys(e.detail).forEach(key => {
				if (relationshipInputValue.hasOwnProperty(key)) {
					relationshipInputValue[key] = e.detail[key];
				}
			});

			let formData = {
				...e.detail
			};
			if (!isEmpty(pendingFormData)) {
				formData = { ...pendingFormData, ...formData };
			}
			pendingFormData = formData;
			const { verification_status, comment } = relationshipInputValue;
			if (
				verification_status === VERIFICATION_STATUS.ESCALATED &&
				isEmpty(comment)
			) {
				toasts.error(
					'Comment cannot be empty when status is Escalated.'
				);
				return;
			}
			await updateRelationship(relationship.id, formData);
			pendingFormData = null;
			toasts.success('Relationship updated successfully');
			await refreshDatatable(relationship.parent_root_id === root.id);
			onClose();
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	};

	$: config = [
		{
			type: COMPONENT_TYPES.SELECT_BOX,
			props: {
				label: 'Parent root name',
				value: relationshipInputValue.parent_root_name,
				disabled: true,
			},
		},
		{
			type: COMPONENT_TYPES.SELECT_BOX,
			props: {
				label: 'Child root name',
				value: relationshipInputValue.child_root_name,
				disabled: true,
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
				value: relationshipInputValue.verification_status,
				required: true,
				onClickHandler: (e) => (selectedVerificationStatus = e.value),
			},
		},
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				label: 'Comment',
				placeholder: 'Enter comment',
				name: 'comment',
				value: relationshipInputValue.comment,
			},
		},
		{
			type: COMPONENT_TYPES.BUTTON,
			props: [
				{
					name: 'Create',
					type: 'primary',
					buttonType: 'submit',
				},
			],
		},
	];
</script>

<Modal title="Edit Relationship" showModal={true} {onClose}>
	<svelte:fragment slot="content">
		<DynamicForm {config} on:submit={onEditRelationship} />
	</svelte:fragment>
</Modal>

<style lang="scss">
	.relationship {
		&__add {
			display: flex;
			flex-direction: column;
			gap: 10px;
		}
		&__add-btn {
			align-self: flex-end;
		}
	}
</style>

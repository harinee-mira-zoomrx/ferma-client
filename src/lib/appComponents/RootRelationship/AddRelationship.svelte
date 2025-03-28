<script>
	import DynamicForm from '@components/DynamicForm/DynamicForm.svelte';
	import { loader } from '@components/Loader/Loader';
	import Modal from '@components/Modal/Modal.svelte';
	import { toasts } from '@components/Toast/toasts';
	import {
		RELATIONSHIP_MAPPING,
		createRelationship,
	} from '@models/relationships';
	import {
		fetchSelectRootsSynonymsByLabel,
	} from '@models/roots';
	import { COMPONENT_TYPES } from '@utils/constants';
	import { VERIFICATION_STATUS } from '@utils/constants.js';
	import { transformSnakeToCapitalized } from '@utils/utility';
	import isEmpty from '@utils/is-empty';

	export let root;
	export let onClose;
	export let isParentAdd = true;
	export let refreshDatatable = (_) => {};
	let selectedParentRootOption;
	let selectedChildRootOption;
	let labelAttributes = [];
	let selectedVerificationStatus = '';

	if (isParentAdd) {
		selectedParentRootOption = {
			value: root.id,
			label: root.name,
			data: root,
		};
		labelAttributes = RELATIONSHIP_MAPPING[root.label].child.map((rel) => rel.rootLabel)
	} else {
		selectedChildRootOption = {
			value: root.id,
			label: root.name,
			data: root,
		};
		labelAttributes = RELATIONSHIP_MAPPING[root.label].parent.map((rel) => rel.rootLabel)
	}

	const onCreateRelationship = async (e) => {
		try {
			loader.show();
			const { verification_status, comment } = e.detail;
			if (
				verification_status === VERIFICATION_STATUS.ESCALATED &&
				isEmpty(comment)
			) {
				toasts.error(
					'Comment cannot be empty when status is Escalated.'
				);
				return;
			}
			await createRelationship(e.detail);
			toasts.success('Relationship created successfully');
			await refreshDatatable(isParentAdd);
			onClose();
			selectedParentRootOption = null;
			selectedChildRootOption = null;
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	};

	let parentRootComponent = {
		type: COMPONENT_TYPES.ROOT_SELECT_BOX,
		props: {
			label: 'Parent root name',
			value: selectedParentRootOption,
			loadOptions: fetchSelectRootsSynonymsByLabel(labelAttributes),
			placeholder: 'Select parent root name',
			required: true,
			disabled: isParentAdd,
			name: 'parent_root_id',
			clearable: true,
		}
	}
	let childRootComponent = {
		type: COMPONENT_TYPES.ROOT_SELECT_BOX,
		props: {
			label: 'Child root name',
			value: selectedChildRootOption,
			loadOptions: fetchSelectRootsSynonymsByLabel(labelAttributes),
			placeholder: 'Select child root name',
			required: true,
			disabled: !isParentAdd,
			name: 'child_root_id',
			clearable: true,
		}
	}
	$: config = [
		...(isParentAdd
				? [parentRootComponent, childRootComponent]
				: [childRootComponent, parentRootComponent]
		),
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
				onClickHandler: (e) => (selectedVerificationStatus = e.value)
			},
		},
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				label: 'Comment',
				placeholder: 'Enter comment',
				name: 'comment',
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

<Modal title="Create Relationship" showModal={true} {onClose}>
	<svelte:fragment slot="content">
		<DynamicForm {config} on:submit={onCreateRelationship} />
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

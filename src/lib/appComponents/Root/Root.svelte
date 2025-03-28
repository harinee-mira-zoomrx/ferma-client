<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import { COMPONENT_TYPES, VERIFICATION_STATUS } from '@utils/constants.js';
	import { push } from 'svelte-spa-router';
	import { fetchRoot, updateRoot } from '@models/roots';
	import { toasts } from '@components/Toast/toasts';
	import { loader } from '@components/Loader/Loader.js';
	import isEmpty from '@utils/is-empty';
	import DynamicForm from '@components/DynamicForm/DynamicForm.svelte';
	import MergeRoot from '@appComponents/MergeRoot/MergeRoot.svelte';
	import LabelChange from '@appComponents/LabelChange/LabelChange.svelte';
	import { authorization } from '@stores/authorization.store';
	import PendingActions from './PendingActions/PendingActions.svelte';
	import { transformSnakeToCapitalized } from '@utils/utility';

	export let rootId;

	const dispatch = createEventDispatcher();
	let root = null;
	let editedRoot = null;
	let isInvalidTerm = false;
	let pendingFormData = null;
	let refreshPendingActions = 1;
	let hasLabelChangePendingAction = false;
	let { permissions } = $authorization;
	let hasPendingActions = false;
	let refreshMergeRoot = 1;
	let pendingRootToBeMerged = [];

	$: config = [
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'name',
				label: editedRoot?.label + ' Name',
				placeholder: 'Enter root name',
				value: editedRoot?.name,
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
				value: {
					label: editedRoot?.is_case_sensitive || false ? 'True' : 'False',
					value: editedRoot?.is_case_sensitive || false,
				},
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
				value: {
					label:
						editedRoot?.is_meta_data_verified || false ? 'True' : 'False',
					value: editedRoot?.is_meta_data_verified || false,
				},
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
				value: editedRoot?.verification_status,
				required: true,
				infoMessage:
					'Verification Status of Root will automatically apply to its generated synonyms',
			},
		},
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				label: 'Comment',
				value: editedRoot?.comment,
				placeholder: 'Enter a comment',
				name: 'comment',
			},
		},
		{
			type: COMPONENT_TYPES.ALERT,
			hide: !isInvalidTerm,
			props: {
				severity: 'warning',
				message: 'The root name is marked as invalid',
				checkBoxMessage: 'Confirm to add as new root.',
				value: editedRoot?.allow_invalid_term,
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

	const onUpdateRoot = async (e) => {
		try {
			loader.show();
			Object.keys(e.detail).forEach((key) => {
				if (editedRoot.hasOwnProperty(key)) {
					editedRoot[key] = e.detail[key];
				}
			});
			let formData = {
				...e.detail,
			};
			if (!isEmpty(pendingFormData)) {
				formData = { ...pendingFormData, ...formData };
			}
			pendingFormData = formData;
			const { verification_status, comment } = editedRoot;
			if (root.verification_status === VERIFICATION_STATUS.ESCALATED && hasPendingActions) {
				if (verification_status && verification_status !== VERIFICATION_STATUS.ESCALATED)  {
					toasts.error(
						'Status cannot be changed from escalated when there are pending actions.'
					);
					return;
				}
			}
			if (
				verification_status === VERIFICATION_STATUS.ESCALATED &&
				isEmpty(comment)
			) {
				toasts.error(
					'Comment cannot be empty when status is Escalated.'
				);
				return;
			}
			await updateRoot(root.id, formData);
			Object.keys(editedRoot).forEach((key) => {
				if (root.hasOwnProperty(key)) {
					root[key] = editedRoot[key];
				}
			});
			pendingFormData = null;
			isInvalidTerm = false;
			toasts.success('Root updated successfully');
			dispatch('RootDetailChange', { ...root });
			dispatch('EscalateOverallStatus', {
				root:
					root.verification_status === VERIFICATION_STATUS.ESCALATED,
			});
			dispatch('RefreshAuditLog');
		} catch (error) {
			handleError(error);
		} finally {
			loader.hide();
		}
	};
	function handleError(error) {
		if (error?.status === 422) {
			if (permissions.canInvalidateRoot) {
				isInvalidTerm = true;
			} else {
				toasts.error(
					error.message ||
						'The root name is already marked as invalid.'
				);
			}
		} else {
			editedRoot = { ...root, allow_invalid_term: false };
			toasts.error(error.message || 'An unexpected error occurred.');
		}
	}

	const fetchdata = async () => {
		try {
			loader.show();
			let queryParams = { overall_status: true };
			const response = await fetchRoot(rootId, queryParams);
			root = response?.data || {};
			let meta = response?.meta || {};
			editedRoot = { ...root, allow_invalid_term: false };
			dispatch('RootDetailChange', { ...root });
			dispatch('EscalateOverallStatus', {
				synonyms: meta.escalated_synonyms,
				relationship: meta.escalated_relationships,
				root: root.verification_status === VERIFICATION_STATUS.ESCALATED,
			});
		} catch (error) {
			toasts.error(error.message || error.detail || 'An unexpected error occurred.');
			push('/roots');
		} finally {
			loader.hide();
		}
	};

	onMount(() => {
		fetchdata();
	});

	const reloadData = () => {
		fetchdata();
		refreshPendingActions = refreshPendingActions + 1;
		dispatch('RefreshAuditLog');
	};

	const handleLabelChangePendingAction = (event) => {
		hasLabelChangePendingAction = event.detail;
	}

	const handleHasPendingActionsStatus = (event) => {
		hasPendingActions = event.detail;
	}

	const handlePendingRootToBeMerged = (event) => {
		pendingRootToBeMerged = event.detail;
		refreshMergeRoot = refreshMergeRoot + 1;
	}
 </script>

{#if root}
	<div class="root-crud">
		<div class="root-crud__main-actions">
			<div class="root-crud__update-actions">
				<span class="root-crud__header">
					Root Details
				</span>
				<div class="root-crud__content">
					<DynamicForm {config} on:submit={onUpdateRoot} />
				</div>
			</div>
			{#key refreshMergeRoot}
				<MergeRoot {root} on:mergeRoot={reloadData} {pendingRootToBeMerged}/>
			{/key}
			{#if !hasLabelChangePendingAction}
				<LabelChange {root} on:labelChange={reloadData} />
			{/if}
		</div>
		{#key refreshPendingActions}
			<div class="root-crud__pending-actions">
				<PendingActions {root} on:InvalidPendingAction on:LabelChangePendingAction={handleLabelChangePendingAction} on:labelChange={reloadData} on:HasPendingActions={handleHasPendingActionsStatus} on:PendingRootToBeMerged={handlePendingRootToBeMerged} on:RefreshAuditLog/>
			</div>
		{/key}
	</div>
{/if}

<style src="./style.scss"></style>

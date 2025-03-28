<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import { push } from 'svelte-spa-router';
	import {
		fetchPendingActions,
		deletePendingAction,
		approvePendingAction,
		PENDING_ACTIONS,
		PENDING_ACTIONS_ENTITY,
	} from '@models/pendingActions';
	import { loader } from '@components/Loader/Loader.js';
	import { toasts } from '@components/Toast/toasts';
	import isEmpty from '@utils/is-empty';
	import PendingActionTable from './PendingActionTable.svelte';
	import ConfirmationModal from './ConfirmationModal.svelte';
	import { authorization } from '@stores/authorization.store';

	export let root;

	const dispatch = createEventDispatcher();

	let pendingActions = {};
	let disableLabelChange = false;
	let disablInvalidate = false;
	let hasInvalidPendingAction = false;
	let hasLabelChangePendingAction = false;
	let showConfirmation = false;
	let selectedAction = null;
	let selectedOperation = null;
	let { permissions } = $authorization;
	let mergeColumns = [
		{
			label: 'Root to be Merged',
			value: 'root_name',
			width: '30%',
		},
		{
			label: 'Comments',
			value: 'comment',
			fallback: '-',
			width: '30%',
		},
		{
			label: 'Triggered By',
			value: 'triggered_by',
			width: '20%',
		},
		{
			label: 'Action',
			isActionColumn: true,
			width: '20%',
		},
		
	];
	let labelChangeColumns = [
		{
			label: 'New Label',
			value: 'value_1',
			width: '30%',
		},
		{
			label: 'Comments',
			value: 'comment',
			fallback: 'No comment',
			width: '30%',
		},
		{
			label: 'Triggered By',
			value: 'triggered_by',
			width: '20%',
		},
		{
			label: 'Action',
			isActionColumn: true,
			width: '20%',
		},
	];

	onMount(() => {
		loadData();
	});

	const loadData = async () => {
		try {
			loader.show();
			pendingActions = await fetchPendingActions(root.id);
			if (pendingActions?.LABEL_CHANGE?.length) {
				disableLabelChange = !isEmpty(pendingActions.MERGE)
					? true
					: false;
			}
			if (pendingActions?.INVALID?.length) {
				disablInvalidate =
					(!isEmpty(pendingActions.MERGE)) ||
					!isEmpty(pendingActions.LABEL_CHANGE) ||
					pendingActions.INVALID[0].affected_entities.length
						? true
						: false;
				hasInvalidPendingAction = true;
			} else {
				hasInvalidPendingAction = false;
			}
			if (pendingActions?.LABEL_CHANGE?.length) {
				hasLabelChangePendingAction = true;
			} else {
				hasLabelChangePendingAction = false;
			}
			if (pendingActions?.MERGE?.length) {
				dispatch('PendingRootToBeMerged', pendingActions.MERGE.map( action => +action.value_1));
			}
			dispatch('InvalidPendingAction', hasInvalidPendingAction);
			dispatch('LabelChangePendingAction', hasLabelChangePendingAction);
			dispatch('HasPendingActions', hasInvalidPendingAction || hasLabelChangePendingAction || !!pendingActions?.MERGE?.length);
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
			pendingActions = {};
		} finally {
			loader.hide();
		}
	};

	const approve = async () => {
		try {
			loader.show();
			await approvePendingAction(selectedAction.id);
			if (selectedOperation === PENDING_ACTIONS.INVALID) {
				push('/roots');
			}
			if (selectedOperation === PENDING_ACTIONS.LABEL_CHANGE) {
				dispatch('labelChange');
			}
			if (selectedOperation !== PENDING_ACTIONS.LABEL_CHANGE) {
				// During label change the pending action component will be rerendered as a result loaddata will be called automatically
				await loadData();
			}
			dispatch('RefreshAuditLog');
			selectedAction = null;
			selectedOperation = null;
			showConfirmation = false;
			toasts.success('Approved successfully');
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	};

	const handleApprove = (action, operation) => {
		showConfirmation = true;
		selectedAction = action;
		selectedOperation = operation;
	};

	const handleReject = async (action) => {
		try {
			loader.show();
			await deletePendingAction(action.id);
			await loadData();
			dispatch('RefreshAuditLog');
			toasts.success('Rejected successfully');
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	};

	const handleAction = (action, type, operation) => {
		if (type === 'reject') {
			handleReject(action);
		} else {
			handleApprove(action, operation);
		}
	};

	const getAffectedEntitiesMessageForMerge = (affectedEntities) => {
		const hasInvalid = affectedEntities.some((e) => e.action === PENDING_ACTIONS.INVALID);
		const hasLabelChange = affectedEntities.some(
			(e) => e.action === PENDING_ACTIONS.LABEL_CHANGE
		);

		if (hasInvalid && hasLabelChange) {
			return 'Marked for invalidation and label change';
		} else if (hasInvalid) {
			return 'Marked for invalidation';
		} else if (hasLabelChange) {
			return 'Marked for label change';
		}
		return null;
	};

	const getAffectedEntitiesMessageForLabelChange = (affectedEntities) => {
		const entity = affectedEntities[0];
		return `Pending to be merged with <a style="color: #7d2727; font-weight: 700;" target="_blank" href="/#/roots/${entity.entity_id}" class="link">${entity.entity_root_name}</a>`;
	};

	const getAffectedEntitiesMessage = (affectedEntities, operation) => {
		if (isEmpty(affectedEntities)) return '';
		if (operation === PENDING_ACTIONS.MERGE) {
			return getAffectedEntitiesMessageForMerge(affectedEntities);
		} else if (operation === PENDING_ACTIONS.LABEL_CHANGE) {
			return getAffectedEntitiesMessageForLabelChange(affectedEntities);
		}
	};

	const hasLabelChangeInAffectedEntities = (affectedEntities) => {
		return affectedEntities.some(
			(entity) => entity.action === PENDING_ACTIONS.LABEL_CHANGE
		);
	};
</script>

{#if !isEmpty(pendingActions)}
	<div class="pending-actions__title">Pending Actions to Approve</div>
	<div class="pending-actions__container">
		{#if !isEmpty(pendingActions.MERGE)}
			<div class="pending-action">
				<div class="pending-action__title">Merge Root</div>
				<div class="pending-action__container">
					<PendingActionTable
						actions={pendingActions.MERGE}
						columns={mergeColumns}
						{getAffectedEntitiesMessage}
						{handleAction}
						operation={'MERGE'}
						disableApprove={hasLabelChangeInAffectedEntities}
						isLeadUser={permissions.canMergeRoot}
					/>
				</div>
			</div>
		{/if}
		{#if !isEmpty(pendingActions.LABEL_CHANGE)}
			<div class="pending-action">
				<div class="pending-action__title">Label Change</div>
				<div class="pending-action__container">
					<PendingActionTable
						actions={pendingActions.LABEL_CHANGE}
						columns={labelChangeColumns}
						{getAffectedEntitiesMessage}
						{handleAction}
						operation={'LABEL_CHANGE'}
						disableApprove={() => disableLabelChange}
						isLeadUser={permissions.canChangeRootLabel}
					/>
				</div>
			</div>
		{/if}
		{#if !isEmpty(pendingActions.INVALID)}
			<div class="pending-action-invalidate">
				<div class="pending-action-invalidate__header">
					<div class="pending-action-invalidate__header-title">
						Marked as invalid
					</div>
					<div class="pending-action-invalidate__header-actions">
						{#if permissions.canInvalidateRoot}
							<button
								class="approve-btn {disablInvalidate
									? 'disabled-btn'
									: ''}"
								disabled={disablInvalidate}
								on:click={() =>
									handleApprove(pendingActions.INVALID[0], PENDING_ACTIONS.INVALID)}
								>Approve</button
							>
						{/if}
						<button
							class="reject-btn invalidate-reject-btn"
							on:click={() =>
								handleReject(pendingActions.INVALID[0])}
							>Reject</button
						>
					</div>
				</div>
				{#if !isEmpty(pendingActions.INVALID[0].affected_entities)}
					<div class="pending-action-invalidate__info">
						Pending to be merged with <a
							target="_blank"
							href="/#/roots/{pendingActions.INVALID[0]
								.affected_entities[0].entity_id}"
							class="link"
							>{pendingActions.INVALID[0].affected_entities[0]
								.entity_root_name}</a
						>
					</div>
				{/if}
				<div class="pending-action-invalidate__comment">
					Comment: {pendingActions.INVALID[0].comment}
				</div>
				<div class="pending-action-invalidate__comment">
					Triggered By: {pendingActions.INVALID[0].triggered_by}
				</div>
			</div>
		{/if}
	</div>
{/if}

{#if showConfirmation}
	<ConfirmationModal
		action={selectedAction}
		operation={selectedOperation}
		onClose={() => {
			showConfirmation = false;
			selectedAction = null;
			selectedOperation = null;
		}}
		onConfirm={approve}
	/>
{/if}

<style src="./style.scss"></style>

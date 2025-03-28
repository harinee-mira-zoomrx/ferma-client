<script>
	import { createEventDispatcher } from 'svelte';
	import Button from '@components/Button/Button.svelte';
	import { loader } from '@components/Loader/Loader';
	import Selectbox from '@components/Selectbox/Selectbox.svelte';
	import Textbox from '@components/Textbox/Textbox.svelte';
	import { toasts } from '@components/Toast/toasts';
	import { fetchSelectRootsByLabel, mergeRoot } from '@models/roots';
	import {
		createPendingAction,
		PENDING_ACTIONS,
		PENDING_ACTIONS_ENTITY,
	} from '@models/pendingActions';
	import { authorization } from '@stores/authorization.store';
	import ConfirmationModal from '@appComponents/MergeRoot/ConfirmationModal.svelte'; // Import the new modal component

	export let root;
	export let pendingRootToBeMerged = [];

	const dispatch = createEventDispatcher();

	let selectedRootOption;
	let refreshSelectBox = 1;
	let isInvalidSource = false;
	let showConfirmationModal = false;
	let comment = '';
	let { permissions } = $authorization;

	const onRootMerge = async () => {
		try {
			loader.show();
			if (permissions.canMergeRoot) {
				await mergeRoot(
					selectedRootOption.data.id,
					root.id,
					isInvalidSource
				);
				toasts.success(
					`${selectedRootOption.data.name} merge with ${root.name} successfully.`
				);
			} else {
				await createPendingAction({
					entity: PENDING_ACTIONS_ENTITY.ROOTS,
					entity_id: root.id,
					action: PENDING_ACTIONS.MERGE,
					value_1: selectedRootOption.data.id + '',
					comment: comment,
				});
				toasts.success('Merge action has been submitted for approval.');
			}
			selectedRootOption = null;
			isInvalidSource = false;
			refreshSelectBox += 1;
			dispatch('mergeRoot');
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			comment = '';
			showConfirmationModal = false;
			loader.hide();
		}
	};
	const fetchRootsToBeMerged = (label) => {
		const fetchRoot = fetchSelectRootsByLabel(label);
		return async (filterText) => {
			let roots = await fetchRoot(filterText);
			return roots.filter((rootData) => {
				return rootData.value !== root.id && !pendingRootToBeMerged.includes(rootData.value);
			});
		};
	};
	const toggleConfirmationModal = () => {
		comment = '';
		showConfirmationModal = !showConfirmationModal;
	};
</script>

{#if root}
	<div class="root-merge">
		<span class="root-merge__header"> Merge </span>
		<form
			class="root-merge__content"
			on:submit|preventDefault={toggleConfirmationModal}
		>
			<Textbox value={root.name} label="Main root name" />
			{#key refreshSelectBox}
				<Selectbox
					label="Root to be merged"
					placeholder="Select root to be merged"
					bind:value={selectedRootOption}
					loadOptions={fetchRootsToBeMerged(root.label)}
					clearable={true}
					required={true}
				/>
			{/key}
			<!-- <div class="checkbox">
				Delete root to be merged:
				<input bind:checked={isInvalidSource} type="checkbox" />
			</div> -->

			<Button type="secondary" buttonType="submit">{permissions.canMergeRoot? 'Merge': 'Submit'}</Button>
		</form>
	</div>
	{#if showConfirmationModal}
		<ConfirmationModal
			isLeadUser={permissions.canMergeRoot}
			selectedRoot={selectedRootOption}
			mainRoot={root}
			bind:comment
			onClose={toggleConfirmationModal}
			onConfirm={onRootMerge}
		/>
	{/if}
{/if}

<style src="./style.scss"></style>

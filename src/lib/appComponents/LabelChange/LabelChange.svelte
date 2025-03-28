<script>
	import { createEventDispatcher } from 'svelte';
	import Button from '@components/Button/Button.svelte';
	import { loader } from '@components/Loader/Loader';
	import Selectbox from '@components/Selectbox/Selectbox.svelte';
	import Textbox from '@components/Textbox/Textbox.svelte';
	import { toasts } from '@components/Toast/toasts';
	import { updateLabel } from '@models/roots';
	import {
		createPendingAction,
		PENDING_ACTIONS,
		PENDING_ACTIONS_ENTITY,
	} from '@models/pendingActions';
	import ConfirmationModal from '@appComponents/LabelChange/ConfirmationModal.svelte'; // Import the new modal component
    import { ROOT_LABELS } from '@models/roots';
    import { transformSnakeToCapitalized } from '@utils/utility';
	import { authorization } from '@stores/authorization.store';

	export let root;

	const dispatch = createEventDispatcher();

	let selectedLabelOption;
	let refreshSelectBox = 1;
	let isInvalidSource = false;
	let showConfirmationModal = false;
	let comment = '';
	let { permissions } = $authorization;

	const onLabelChange = async () => {
		try {
			loader.show();
			if (permissions.canChangeRootLabel) {
				await updateLabel(
					root.id,
                    selectedLabelOption.value
				);
				toasts.success(
					`Updated label to ${selectedLabelOption.value} successfully.`
				);
			} else {
				await createPendingAction({
					entity: PENDING_ACTIONS_ENTITY.ROOTS,
					entity_id: root.id,
					action: PENDING_ACTIONS.LABEL_CHANGE,
					value_1: selectedLabelOption.value,
					comment: comment,
				});
				toasts.success('Label change has been submitted for approval.');
			}
			selectedLabelOption = null;
			isInvalidSource = false;
			refreshSelectBox += 1;
			dispatch('labelChange');
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			comment = '';
			showConfirmationModal = false;
			loader.hide();
		}
	};
	const toggleConfirmationModal = () => {
		comment = '';
		showConfirmationModal = !showConfirmationModal;
	};
</script>

{#if root}
	<div class="root-label">
		<span class="root-label__header"> Label Change </span>
		<form
			class="root-label__content"
			on:submit|preventDefault={toggleConfirmationModal}
		>
			<Textbox value={root.label} label="Current label" />
			{#key refreshSelectBox}
				<Selectbox
					label="New label"
					placeholder="Select new label"
					bind:value={selectedLabelOption}
					items={Object.values(ROOT_LABELS).filter((key => key!==root.label)).map((key) => {
						return {
							label: transformSnakeToCapitalized(key),
							value: key,
						};
					})}
					clearable={true}
					required={true}
                    clearFilterTextOnBlur={true}
				/>
			{/key}
			<Button type="secondary" buttonType="submit">{permissions.canChangeRootLabel? 'Change': 'Submit'}</Button>
		</form>
	</div>
	{#if showConfirmationModal}
		<ConfirmationModal
			isLeadUser={permissions.canChangeRootLabel}
			selectedRoot={selectedLabelOption}
			mainRoot={root}
			bind:comment
			onClose={toggleConfirmationModal}
			onConfirm={onLabelChange}
		/>
	{/if}
{/if}

<style src="./style.scss"></style>

<script>
	import Modal from '@components/Modal/Modal.svelte';
	import Selectbox from '@components/Selectbox/Selectbox.svelte';
	import RootSelectbox from '@components/RootSelectbox/RootSelectbox.svelte';
	import Input from '@components/Input/Input.svelte';
	import SegmentPill from '@components/SegmentPill/SegmentPill.svelte';
	import Button from '@components/Button/Button.svelte';
	import Textarea from '@components/Textarea/Textarea.svelte';
	import DiffModal from '@components/DynamicForm/DiffModal/DiffModal.svelte';
	import { toasts } from '@components/Toast/toasts';
	import { fetchTrials } from '@models/trials';
	import { queryConstructor } from '@utils/utility';
	import { loader } from '@components/Loader/Loader';
	import {
		createReadoutKeyword,
		updateReadoutKeywords,
		READOUT_KEYWORDS_LABEL,
	} from '@models/readoutKeywords';
	import {
		fetchSelectRootsSynonymsByLabel,
		ROOT_LABELS,
	} from '@models/roots';
	import { VERIFICATION_STATUS } from '@utils/constants';
	import { transformSnakeToCapitalized } from '@utils/utility';
	import isEmpty from '@utils/is-empty';

	export let readoutId;
	export let onClose;
	export let readoutKeyword = null;
	export let refreshDatatable = () => {};

	// @ts-ignore
	let selectedLabel = readoutKeyword?.label || '';
	// @ts-ignore
	let selectedValue = readoutKeyword?.value || '';
	// @ts-ignore
	let valueRootId = readoutKeyword?.value_root_id || null;
	let verificationStatus =
		// @ts-ignore
		readoutKeyword?.verification_status || VERIFICATION_STATUS.NOT_VERIFIED;
	// @ts-ignore
	let comment = readoutKeyword?.comment || '';

	let showEditedModal = false;
	let editedData = [];
	// @ts-ignore
	let originalData = { ...readoutKeyword };

	const labelToRootMapping = {
		[READOUT_KEYWORDS_LABEL.TRIAL_ACRONYM]: [ROOT_LABELS.TRIAL_ACRONYM],
		[READOUT_KEYWORDS_LABEL.DISEASE]: [ROOT_LABELS.DISEASE],
		[READOUT_KEYWORDS_LABEL.SPONSOR]: [ROOT_LABELS.ORGANIZATION],
		[READOUT_KEYWORDS_LABEL.PRIMARY_DRUG]: [
			ROOT_LABELS.BRAND,
			ROOT_LABELS.ACTIVE_INGREDIENT,
			ROOT_LABELS.DRUG_CLASS,
			ROOT_LABELS.TARGET,
		],
		[READOUT_KEYWORDS_LABEL.SECONDARY_DRUG]: [
			ROOT_LABELS.BRAND,
			ROOT_LABELS.ACTIVE_INGREDIENT,
			ROOT_LABELS.DRUG_CLASS,
			ROOT_LABELS.TARGET,
		],
		[READOUT_KEYWORDS_LABEL.COMPARATOR_DRUG]: [
			ROOT_LABELS.BRAND,
			ROOT_LABELS.ACTIVE_INGREDIENT,
			ROOT_LABELS.DRUG_CLASS,
			ROOT_LABELS.TARGET,
		],
	};

	const keywordLabelOptions = Object.values(READOUT_KEYWORDS_LABEL).map(
		(label) => ({
			label: label,
			value: label,
		})
	);

	const trialLoadOptions = async (trialOptionsFilterText) => {
		let trials = [];
		try {
			let queryParam = [
				{
					key: 'nct_id',
					operator: '%%',
					value: trialOptionsFilterText || '',
				},
			];
			trials = await fetchTrials({
				page: 1,
				size: 50,
				query: queryConstructor(queryParam),
				sort_by: 'nct_id:asc',
			});
		} catch (error) {
			console.warn(error);
		}
		return trials.map((trial) => ({
			label: trial.nct_id,
			value: trial.nct_id,
			data: trial,
		}));
	};

	const handleLabelChange = (event) => {
		let label = event.detail.value;
		selectedLabel = label;
		selectedValue = null;
		if (
			label === READOUT_KEYWORDS_LABEL.INDICATION ||
			label === READOUT_KEYWORDS_LABEL.PHASE ||
			label === READOUT_KEYWORDS_LABEL.TRIAL_IDENTIFIER
		) {
			valueRootId = null;
		}
	};

	const handleValueChange = async (event) => {
		selectedValue = event.detail.label;
		if (selectedLabel !== READOUT_KEYWORDS_LABEL.TRIAL_IDENTIFIER) {
			valueRootId = event.detail.value;
		}
	};

	const handleSubmit = () => {
		const updatedKeyword = {
			label: selectedLabel,
			value: selectedValue,
			value_root_id: valueRootId,
			verification_status: verificationStatus,
			comment: comment,
		};

		editedData = [];

		if (readoutKeyword) {
			if (originalData.label !== updatedKeyword.label) {
				editedData.push({
					label: 'Label',
					original: originalData.label,
					edited: updatedKeyword.label,
				});
			}
			if (originalData.value !== updatedKeyword.value) {
				editedData.push({
					label: 'Value',
					original: originalData.value,
					edited: updatedKeyword.value,
				});
			}
			if (originalData.value_root_id !== updatedKeyword.value_root_id) {
				editedData.push({
					label: 'Value Root ID',
					original: originalData.value_root_id,
					edited: updatedKeyword.value_root_id,
				});
			}
			if (
				originalData.verification_status !==
				updatedKeyword.verification_status
			) {
				editedData.push({
					label: 'Verification Status',
					original: originalData.verification_status,
					edited: updatedKeyword.verification_status,
				});
			}

			if (originalData.comment !== updatedKeyword.comment) {
				editedData.push({
					label: 'Comment',
					original: originalData.comment,
					edited: updatedKeyword.comment,
				});
			}

			if (editedData.length === 0) {
				toasts.warn('No changes to update.');
				return;
			}

			showEditedModal = true;
		} else {
			confirmSubmit();
		}
	};

	const confirmSubmit = async () => {
		showEditedModal = false;
		const updatedKeyword = {
			label: selectedLabel,
			value: selectedValue,
			value_root_id: valueRootId,
			verification_status: verificationStatus,
			comment: comment,
		};
		try {
			loader.show();
			if (readoutKeyword) {
				// @ts-ignore
				await updateReadoutKeywords(readoutKeyword.id, updatedKeyword);
				toasts.success('Readout Keyword updated successfully');
			} else {
				updatedKeyword.readout_id = readoutId;
				await createReadoutKeyword(updatedKeyword);
				toasts.success('Readout Keyword created successfully');
			}
			refreshDatatable();
			onClose();
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	};
</script>

<Modal
	title={readoutKeyword ? 'Edit Keyword' : 'Add Keyword'}
	showModal={true}
	{onClose}
>
	<svelte:fragment slot="modal-header-actions">
		<slot />
	</svelte:fragment>
	<svelte:fragment slot="content">
		<div class="form">
			<div class="form__element">
				<Selectbox
					label="Label"
					placeholder="Select label"
					value={selectedLabel && {
						label: selectedLabel,
						value: selectedLabel,
					}}
					items={keywordLabelOptions}
					clearFilterTextOnBlur={true}
					required={true}
					onSelect={handleLabelChange}
				/>
			</div>
			<div class="form__element">
				{#key selectedLabel}
					{#if selectedLabel == READOUT_KEYWORDS_LABEL.INDICATION || selectedLabel == READOUT_KEYWORDS_LABEL.PHASE}
						<Input
							label="Value"
							bind:value={selectedValue}
							required={true}
						/>
					{:else if selectedLabel == READOUT_KEYWORDS_LABEL.TRIAL_IDENTIFIER}
						<Selectbox
							label="Value"
							name="value"
							placeholder="Select value"
							value={selectedValue && {
								label: selectedValue,
								value: selectedValue,
							}}
							loadOptions={trialLoadOptions}
							clearFilterTextOnBlur={true}
							required={true}
							onSelect={handleValueChange}
						/>
					{:else}
						<RootSelectbox
							label="Value"
							name="value"
							placeholder="Select value"
							value={selectedValue && {
								label: selectedValue,
								value: selectedValue,
							}}
							loadOptions={selectedLabel &&
								fetchSelectRootsSynonymsByLabel(
									labelToRootMapping[selectedLabel]
								)}
							clearFilterTextOnBlur={true}
							required={true}
							onSelect={handleValueChange}
						/>
					{/if}
				{/key}
			</div>
			<div class="form__element">
				<Input
					label="Value Root ID"
					value={valueRootId || '-'}
					disabled={true}
				/>
			</div>
			<div class="form__element">
				<SegmentPill
					label="Verification Status"
					name="verificationStatus"
					value={verificationStatus}
					items={Object.values(VERIFICATION_STATUS).map((key) => {
						return {
							label: transformSnakeToCapitalized(key),
							value: key,
						};
					})}
					onClickHandler={(e) => (verificationStatus = e.value)}
				/>
			</div>
			<div class="form__element">
				<Textarea
					label="Comment"
					name="comment"
					value={comment}
					required={verificationStatus ===
						VERIFICATION_STATUS.ESCALATED}
					onInput={(e) => (comment = e.target.textContent)}
				/>
			</div>
			<div class="form__btn-container">
				<Button
					type="primary"
					disabled={!selectedLabel ||
						!selectedValue?.trim() ||
						(verificationStatus === VERIFICATION_STATUS.ESCALATED &&
							isEmpty(comment))}
					onClick={handleSubmit}>Save</Button
				>
			</div>
		</div>
	</svelte:fragment>
</Modal>

{#if showEditedModal}
	<DiffModal
		onClose={() => {
			showEditedModal = false;
		}}
		{editedData}
		onSubmit={confirmSubmit}
	/>
{/if}

<style>
	.form {
		display: flex;
		align-items: flex-start;
		flex-wrap: wrap;
		column-gap: 30px;
		row-gap: 15px;
		max-width: 100%;
		font-size: 14px;
	}

	.form__element {
		width: 100%;
	}

	.form__element {
		display: flex;
		align-items: center;
		justify-content: flex-start;
	}

	.form__btn-container {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		width: 100%;
		gap: 15px;
	}
</style>

<script>
	import Modal from '@components/Modal/Modal.svelte';
	import Selectbox from '@components/Selectbox/Selectbox.svelte';
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
		createReadoutStudy,
		updateReadoutStudies,
	} from '@models/readoutStudies';
	import { VERIFICATION_STATUS } from '@utils/constants';
	import { transformSnakeToCapitalized } from '@utils/utility';
	import isEmpty from '@utils/is-empty';
	import Textbox from '@components/Textbox/Textbox.svelte';

	export let readoutId;
	export let onClose;
	export let readoutStudy = null;
	export let refreshDatatable = () => {};

	// @ts-ignore
	let selectedStudyId = readoutStudy?.study_id || '';
	// @ts-ignore
	let selectedNctId = readoutStudy?.nct_id || '';
	// @ts-ignore
	let selectedAcronym = readoutStudy?.acronym || '';
	let verificationStatus =
		// @ts-ignore
		readoutStudy?.verification_status || VERIFICATION_STATUS.NOT_VERIFIED;
	// @ts-ignore
	let comment =  readoutStudy?.comment || '';
	let showEditedModal = false;
	let editedData = [];
	// @ts-ignore
	let originalData = { ...readoutStudy };

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

	const handleStudyIdChange = async (event) => {
		selectedStudyId = event.target.value;
		if (selectedStudyId) {
			try {
				let trials = await fetchTrials({
					page: 1,
					size: 1,
					query: queryConstructor([
						{
							key: 'study_id',
							operator: '==',
							value: selectedStudyId,
						},
					]),
				});
				if (trials.length > 0) {
					selectedNctId = trials[0].nct_id;
					selectedAcronym = trials[0].acronym;
				} else {
					selectedNctId = null;
					selectedAcronym = null;
				}
			} catch (error) {
				console.warn(error);
			}
		} else {
			selectedNctId = null;
			selectedAcronym = null;
		}
	};

	const handleNctIdChange = async (event) => {
		selectedNctId = event.detail.label;
		selectedStudyId = event.detail.data.study_id;
		selectedAcronym = event.detail.data.acronym;
	};

	const handleSubmit = () => {
		const updatedStudy = {
			study_id: selectedStudyId,
			nct_id: selectedNctId,
			acronym: selectedAcronym,
			verification_status: verificationStatus,
			comment: comment,
		};

		editedData = [];

		if (readoutStudy) {
			if (originalData.study_id !== updatedStudy.study_id) {
				editedData.push({
					label: 'Study ID',
					original: originalData.study_id,
					edited: updatedStudy.study_id,
				});
			}
			if (originalData.nct_id !== updatedStudy.nct_id) {
				editedData.push({
					label: 'NCT ID',
					original: originalData.nct_id,
					edited: updatedStudy.nct_id,
				});
			}
			if (originalData.acronym !== updatedStudy.acronym) {
				editedData.push({
					label: 'Acronym',
					original: originalData.acronym,
					edited: updatedStudy.acronym,
				});
			}
			if (
				originalData.verification_status !==
				updatedStudy.verification_status
			) {
				editedData.push({
					label: 'Verification Status',
					original: originalData.verification_status,
					edited: updatedStudy.verification_status,
				});
			}
			if (
				originalData.comment !==
				updatedStudy.comment
			) {
				editedData.push({
					label: 'Comment',
					original: originalData.comment,
					edited: updatedStudy.comment,
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
		let updatedStudy = {
			study_id: selectedStudyId,
			verification_status: verificationStatus,
			comment: comment,
		};
		try {
			loader.show();
			if (readoutStudy) {
				// @ts-ignore
				await updateReadoutStudies(readoutStudy.id, updatedStudy);
				toasts.success('Readout Study updated successfully');
			} else {
				updatedStudy = { ...updatedStudy, readout_id: readoutId };
				await createReadoutStudy(updatedStudy);
				toasts.success('Readout Study created successfully');
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
	title={readoutStudy ? 'Edit Study' : 'Add Study'}
	showModal={true}
	{onClose}
>
	<svelte:fragment slot="modal-header-actions">
		<slot />
	</svelte:fragment>
	<svelte:fragment slot="content">
		<div class="form">
			<div class="form__element">
				<Input
					label="Study ID"
					value={selectedStudyId || ''}
					onInput={handleStudyIdChange}
				/>
			</div>
			<div class="form__element">
				<Selectbox
					label="NCT ID"
					name="nct_id"
					placeholder="Select NCT ID"
					value={selectedNctId && {
						label: selectedNctId,
						value: selectedNctId,
					}}
					loadOptions={trialLoadOptions}
					clearFilterTextOnBlur={true}
					onSelect={handleNctIdChange}
				/>
			</div>
			<div class="form__element">
				<Textbox
					value={selectedAcronym}
					label="Acronym"
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
					required={verificationStatus === VERIFICATION_STATUS.ESCALATED}
					onInput={(e) => (comment = e.target.textContent)}
				/>
			</div>
			<div class="form__btn-container">
				<Button
					type="primary"
					disabled={!selectedStudyId.toString()?.trim() || ((verificationStatus === VERIFICATION_STATUS.ESCALATED) && isEmpty(comment))}
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

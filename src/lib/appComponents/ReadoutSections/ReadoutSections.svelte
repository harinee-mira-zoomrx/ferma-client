<script>
	import AdvancedDataSection from '@appComponents/ReadoutSections/Sections/AdvancedDataSection.svelte';
	import BasicDataSection from '@appComponents/ReadoutSections/Sections/BasicDataSection.svelte';
	import StudyDesignSection from '@appComponents/ReadoutSections/Sections/StudyDesignSection.svelte';
	import {
		fetchReadoutSections,
		READOUTS_SECTION_TYPE,
		updateReadoutSections,
	} from '@models/readoutsSections.js';
	import { onMount } from 'svelte';
	import { loader } from '@components/Loader/Loader.js';
	import { toasts } from '@components/Toast/toasts.js';
	import Button from '@components/Button/Button.svelte';
	import isEmpty from '@utils/is-empty.js';
	import DiffModal from '@components/DynamicForm/DiffModal/DiffModal.svelte';

	export let readoutId;
	export let contentType = '';

	const defaultData = {
		background: {
			section_content: {},
			section_summary: {},
			section_type: READOUTS_SECTION_TYPE.BACKGROUND,
		},
		study_design: {
			section_content: {},
			section_summary: {},
			section_type: READOUTS_SECTION_TYPE.STUDY_DESIGN,
		},
		efficacy: {
			section_content: [],
			section_summary: {},
			section_type: READOUTS_SECTION_TYPE.EFFICACY,
		},
		safety: {
			section_content: [],
			section_summary: {},
			section_type: READOUTS_SECTION_TYPE.SAFETY,
		},
		conclusion: {
			section_content: {},
			section_summary: {},
			section_type: READOUTS_SECTION_TYPE.CONCLUSION,
		},
	};

	const sectionEditState = {
		background: false,
		study_design: false,
		efficacy: false,
		safety: false,
		conclusion: false,
	};

	let data = {};
	let originalData = {};
	let updatedData = {};
	let showEditedModal = false;
	let editedData = [];

	onMount(async () => {
		await fetchReadoutSectionsData();
	});

	const fetchReadoutSectionsData = async (sectionType = '') => {
		try {
			loader.show();
			let queryParams = { content_type: contentType };
			let response = await fetchReadoutSections(readoutId, queryParams);

			if (sectionType && sectionType !== 'Readout sections') {
				data[sectionType] = response[sectionType];
				if (!(sectionType in data)) {
					data[sectionType] = defaultData[sectionType];
				}
				originalData[sectionType] = JSON.parse(
					JSON.stringify(data[sectionType])
				);
			} else {
				data = response;
				for (const key in defaultData) {
					if (!(key in data)) {
						data[key] = defaultData[key];
					}
				}
				originalData = JSON.parse(JSON.stringify(data));
			}
		} catch (error) {
			data = JSON.parse(JSON.stringify(originalData));
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	};

	const onSubmit = async () => {
		editedData = [];
		updatedData = {};
		const removeId = ({ id, ...rest }) => rest;

		if (
			JSON.stringify(data.background) !==
			JSON.stringify(originalData.background)
		) {
			editedData.push({
				label: READOUTS_SECTION_TYPE.BACKGROUND,
				original: removeId(originalData.background),
				edited: removeId(data.background),
				showDiff: true,
			});
			updatedData.background = data.background;
		}

		if (
			JSON.stringify(data.study_design) !==
			JSON.stringify(originalData.study_design)
		) {
			editedData.push({
				label: 'Study Design',
				original: removeId(originalData.study_design),
				edited: removeId(data.study_design),
				showDiff: true,
			});
			updatedData.study_design = data.study_design;
		}

		if (
			JSON.stringify(data.efficacy) !==
			JSON.stringify(originalData.efficacy)
		) {
			editedData.push({
				label: READOUTS_SECTION_TYPE.EFFICACY,
				original: removeId(originalData.efficacy),
				edited: removeId(data.efficacy),
				showDiff: true,
			});
			updatedData.efficacy = data.efficacy;
		}

		if (
			JSON.stringify(data.safety) !== JSON.stringify(originalData.safety)
		) {
			editedData.push({
				label: READOUTS_SECTION_TYPE.SAFETY,
				original: removeId(originalData.safety),
				edited: removeId(data.safety),
				showDiff: true,
			});
			updatedData.safety = data.safety;
		}

		if (
			JSON.stringify(data.conclusion) !==
			JSON.stringify(originalData.conclusion)
		) {
			editedData.push({
				label: READOUTS_SECTION_TYPE.CONCLUSION,
				original: removeId(originalData.conclusion),
				edited: removeId(data.conclusion),
				showDiff: true,
			});
			updatedData.conclusion = data.conclusion;
		}

		if (editedData.length === 0) {
			toasts.warn('No changes to update.');
			return;
		}

		showEditedModal = true;
	};

	const confirmSubmit = async (sectionType) => {
		showEditedModal = false;

		try {
			loader.show();
			await updateReadoutSections(readoutId, {
				content_type: contentType,
				...updatedData,
			});
			await fetchReadoutSectionsData(sectionType);
			toasts.success(`${sectionType} updated successfully`);
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			if (sectionType === 'Readout sections') {
				for (let key in sectionEditState) {
					sectionEditState[key] = false;
				}
			}
			loader.hide();
		}
	};

	const handleSectionSave = async (e) => {
		let sectionType = '';
		({ sectionType, updatedData } = e);

		await confirmSubmit(sectionType);
		sectionEditState[sectionType] = false;
	};
</script>

{#if !isEmpty(data)}
	<div>
		<div class="section-type">
			<BasicDataSection
				header={READOUTS_SECTION_TYPE.BACKGROUND}
				data={data.background}
				bind:editState={sectionEditState.background}
				onSectionSave={handleSectionSave}
			/>
		</div>

		<div class="section-type">
			{#if data?.study_design}
				<StudyDesignSection
					data={data.study_design}
					bind:editState={sectionEditState.study_design}
					onSectionSave={handleSectionSave}
				/>
			{/if}
		</div>

		<div class="section-type">
			<AdvancedDataSection
				header={READOUTS_SECTION_TYPE.EFFICACY}
				data={data?.efficacy}
				bind:editState={sectionEditState.efficacy}
				onSectionSave={handleSectionSave}
			/>
		</div>

		<div class="section-type">
			<AdvancedDataSection
				header={READOUTS_SECTION_TYPE.SAFETY}
				data={data?.safety}
				bind:editState={sectionEditState.safety}
				onSectionSave={handleSectionSave}
			/>
		</div>

		<div class="section-type">
			<BasicDataSection
				header={READOUTS_SECTION_TYPE.CONCLUSION}
				data={data?.conclusion}
				bind:editState={sectionEditState.conclusion}
				onSectionSave={handleSectionSave}
			/>
		</div>

		<div class="save-button">
			<Button type="secondary" onClick={onSubmit}>Save</Button>
		</div>
	</div>
{/if}

{#if showEditedModal}
	<DiffModal
		onClose={() => {
			showEditedModal = false;
		}}
		{editedData}
		onSubmit={() => confirmSubmit('Readout sections')}
	/>
{/if}

<style src="./style.scss"></style>

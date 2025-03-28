<script>
	import DynamicForm from '@components/DynamicForm/DynamicForm.svelte';
	import Modal from '@components/Modal/Modal.svelte';
	import { COMPONENT_TYPES } from '@utils/constants';
	import {
		DOCUMENT_COMPLEXITY,
		SOURCE_TYPE,
		uploadPDFFile,
	} from '@models/contents';
	import { fetchSelectRootsByLabel } from '@models/contents';
	import { loader } from '@components/Loader/Loader.js';
	import { toasts } from '@components/Toast/toasts.js';
	import { validateURL } from '@utils/utility';
	import { CONFERENCE_SOURCE_NAME } from '@models/readouts';

	export let onClose;
	export let onFileUpload = () => {};

	const SPECIAL_STATUS = [
		'EARNINGS_CALL_PRESENTATION',
		'EARNINGS_CALL_TRANSCRIPT',
		'SEC_FILING',
	];
	let isSpecialCase = false;
	let isEarningsCallTranscript = true;
	let isPressRelease = false;
	let isInvestorReport = false;
	let isJournal = false;
	let isConference = false;
	let isFermaConference = false;

	const handleSourceTypeChange = (event) => {
		isSpecialCase = SPECIAL_STATUS.includes(event.detail.value);
		isEarningsCallTranscript =
			event.detail.value === 'EARNINGS_CALL_TRANSCRIPT';
		isInvestorReport = event.detail.value === 'INVESTOR_REPORT';
		isPressRelease = event.detail.value === 'PRESS_RELEASE';
		isJournal = event.detail.value === 'JOURNAL';
		isConference =
			event.detail.value === 'CONFERENCE' ||
			event.detail.value === 'PUBLIC_CONFERENCE';
		isFermaConference = event.detail.value === 'CONFERENCE';
	};

	$: config = [
		{
			type: COMPONENT_TYPES.SEGMENT_PILL,
			props: {
				name: 'document_complexity',
				label: 'Document Complexity',
				items: DOCUMENT_COMPLEXITY,
				required: true,
				value: {
					label: 'Complex',
					value: 'COMPLEX',
				},
				disabled: isConference,
			},
			preserveUnchangedData: true,
		},
		{
			type: COMPONENT_TYPES.SELECT_BOX,
			props: {
				name: 'source_type',
				label: 'Source Type',
				placeholder: 'Select Source Type',
				items: [
					{
						label: 'Conference Open Data',
						value: 'PUBLIC_CONFERENCE',
					},
					...SOURCE_TYPE,
				],
				required: true,
				clearFilterTextOnBlur: true,
				onSelect: handleSourceTypeChange,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'source_url',
				label: 'Source URL',
				placeholder: 'Enter source URL',
				required: true,
			},
			validation: (value) => {
				if (
					!isFermaConference &&
					(validateURL(value) ||
						(value.trim() === 'NA' && !isFermaConference))
				)
					return true;
				const urlRegex =
					/^https:\/\/zoomrx\.ferma\.ai\/#\/congresses\/\d+\/teams\/\d+\/planners\/\d+\/content$/;
				if (isFermaConference && urlRegex.test(value)) return true;
				toasts.warn('Please provide a valid URL or NA');
				return false;
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'session_id',
				label: 'Session Id',
				type: 'number',
				placeholder: 'Enter session id',
				required: true,
			},
			hide: !isFermaConference,
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'abstract_id',
				label: 'Abstract Id',
				placeholder: 'Enter abstract id',
			},
			hide: !isConference,
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'session_type',
				label: 'Session Type',
				placeholder: 'Enter session type',
				required: true,
			},
			hide: !isFermaConference,
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'session_title',
				label: 'Session Title',
				placeholder: 'Enter session title',
				required: true,
			},
			hide: !isFermaConference,
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'session_url',
				label: 'Session URL',
				placeholder: 'Enter session url',
			},
			hide: !isFermaConference,
		},
		{
			type: COMPONENT_TYPES.SELECT_BOX,
			props: {
				name: 'conference_name',
				label: 'Conference Name',
				placeholder: 'Select conference name',
				items: Object.values(CONFERENCE_SOURCE_NAME),
				required: true,
				clearFilterTextOnBlur: true,
			},
			hide: !isConference,
		},
		{
			type: COMPONENT_TYPES.SEGMENT_PILL,
			hide: !isConference,
			props: {
				name: 'content_type',
				label: 'Content Type',
				items: [
					{
						label: 'Oral Presentation',
						value: 'ORAL_PRESENTATION',
					},
					{
						label: 'Poster',
						value: 'POSTER',
					},
				],
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'end_date',
				label: 'End date',
				type: 'datetime-local',
				required: isFermaConference,
			},
			hide: !isFermaConference,
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'title',
				label: 'Title',
				placeholder: 'Enter title',
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'author',
				label: 'Author',
				placeholder: 'Enter author',
			},
			hide: isConference,
		},
		{
			type: isSpecialCase
				? COMPONENT_TYPES.SELECT_BOX
				: COMPONENT_TYPES.INPUT,
			props: {
				name: 'provider',
				label: isSpecialCase ? 'Organization' : 'Provider',
				placeholder: isSpecialCase
					? 'Select organization'
					: 'Select provider',
				required: isSpecialCase,
				clearFilterTextOnBlur: true,
				loadOptions: fetchSelectRootsByLabel('organization'),
			},
			hide: isFermaConference,
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'published_on',
				label: 'Published On',
				type: 'datetime-local',
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			hide: !isSpecialCase,
			props: {
				name: 'filing_period',
				label: 'Filing Period',
				placeholder: 'Enter filing period. Eg.2023 Q1',
				required: isSpecialCase,
				disabled: !isSpecialCase,
			},
			validation: (value) => {
				if (/^[0-9]{4} Q[1-4]$/.test(value)) {
					return true;
				}
				toasts.warn('Please provide a valid period. Eg.2023 Q1');
				return false;
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				name: 'file',
				label: 'Upload PDF',
				required: true,
				type: 'file',
				additionalProps: {
					accept: '.pdf',
					multiple: false,
				},
			},
		},
		{
			type: COMPONENT_TYPES.SEGMENT_PILL,
			hide: !isEarningsCallTranscript,
			props: {
				name: 'use_as_source',
				label: 'Use as Source',
				items: [
					{
						label: 'True',
						value: true,
					},
					{
						label: 'False',
						value: false,
					},
				],
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.SEGMENT_PILL,
			hide: !isEarningsCallTranscript,
			props: {
				name: 'generate_insight',
				label: 'Generate Insights',
				items: [
					{
						label: 'True',
						value: true,
					},
					{
						label: 'False',
						value: false,
					},
				],
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.SEGMENT_PILL,
			hide: !(
				isPressRelease ||
				isInvestorReport ||
				isJournal ||
				isConference
			),
			props: {
				name: 'generate_readout',
				label: 'Generate Readouts',
				items: [
					{
						label: 'True',
						value: true,
					},
					{
						label: 'False',
						value: false,
					},
				],
				value: {
					label: 'True',
					value: true,
				},
				disabled: true,
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.BUTTON,
			props: [
				{
					buttonType: 'submit',
					type: 'primary',
					name: 'Submit',
				},
			],
		},
	];

	async function onSubmit(e) {
		try {
			loader.show();
			const data = { ...e.detail };
			const formData = new FormData();
			if (!isEarningsCallTranscript) {
				if (
					isInvestorReport ||
					isJournal ||
					isPressRelease ||
					isConference
				) {
					data['generate_insight'] = false;
					data['generate_readout'] = true;
				} else {
					data['generate_insight'] = true;
				}
			}
			for (let key in data) {
				if (data[key] !== null && data[key] !== undefined) {
					if (
						key === 'source_type' &&
						data[key] === 'PUBLIC_CONFERENCE'
					) {
						formData.append(key, 'CONFERENCE');
					} else {
						formData.append(key, data[key]);
					}
				}
			}
			if (isFermaConference) {
				formData.append('provider', 'FERMA_CONGRESS');
			}
			if (
				data.source_type === 'EARNINGS_CALL_TRANSCRIPT' &&
				data.generate_insight === false &&
				data.use_as_source === false
			) {
				toasts.warn(
					'Either "generate insight" or "use as source" flag should be enabled'
				);
				return;
			}
			const { id } = await uploadPDFFile(formData);
			onFileUpload();
			toasts.success(
				`Upload successful. Record with ID ${id} is created in the contents table.`
			);
			onClose();
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	}
</script>

<Modal title="Upload File" showModal={true} {onClose}>
	<svelte:fragment slot="content">
		<DynamicForm {config} on:submit={onSubmit} columns={2} />
	</svelte:fragment>
</Modal>

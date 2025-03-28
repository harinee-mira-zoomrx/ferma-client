<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import { fetchReadout, updateReadout } from '@models/readouts';
	import { toasts } from '@components/Toast/toasts';
	import { loader } from '@components/Loader/Loader';
	import { COMPONENT_TYPES } from '@utils/constants';
	import {
		READOUT_SOURCE_TYPE,
		READOUT_SOURCE_NAME,
		READOUT_CATEGORY,
	} from '@models/readouts';
	import DynamicForm from '@components/DynamicForm/DynamicForm.svelte';
	import {
		fetchSelectRootsSynonymsByLabel,
		ROOT_LABELS,
	} from '@models/roots.js';
	import isEmpty from '@utils/is-empty.js';
	import { VERIFICATION_STATUS } from '@utils/constants';
	import { transformSnakeToCapitalized } from '@utils/utility';
	import { push } from 'svelte-spa-router';

	export let readoutId = null;
	export let url = null;

	const dispatch = createEventDispatcher();
	let data = null;
	let originalData = null;

	$: config = [
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				label: 'Year',
				name: 'year',
				value: data?.year,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				label: 'Abstract Id',
				name: 'abstract_id',
				value: data?.abstract_id,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				label: 'Entity Id',
				name: 'entity_id',
				value: data?.entity_id,
			},
		},
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				label: 'Title',
				name: 'title',
				value: data?.title,
				width: '100%',
			},
		},
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				label: 'Processed Title',
				name: 'processed_title',
				value: data?.processed_title,
				width: '100%',
			},
		},
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				label: 'Overview',
				name: 'overview',
				value: data?.overview,
				width: '100%',
			},
		},
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				label: 'Session Title',
				name: 'session_title',
				value: data?.session_title,
				width: '100%',
			},
		},
		{
			type: COMPONENT_TYPES.SELECT_BOX,
			props: {
				label: 'Source Type',
				name: 'source_type',
				items: Object.values(READOUT_SOURCE_TYPE),
				clearFilterTextOnBlur: true,
				placeholder: 'Select source type',
				value: data?.source_type,
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.SELECT_BOX,
			props: {
				label: 'Source Name',
				name: 'source_name',
				items: Object.values(READOUT_SOURCE_NAME),
				clearFilterTextOnBlur: true,
				placeholder: 'Select source name',
				value: data?.source_name,
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				label: 'Source URL',
				name: 'url',
				value: data?.url,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				label: 'Start Date',
				name: 'start_date',
				value: data?.start_date,
				type: 'datetime-local',
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				label: 'End Date',
				name: 'end_date',
				value: data?.end_date,
				type: 'datetime-local',
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				label: 'Date',
				name: 'date',
				value: data?.date,
				type: 'datetime-local',
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.SELECT_BOX,
			props: {
				label: 'Category',
				name: 'category',
				value: data?.category,
				items: Object.values(READOUT_CATEGORY),
				clearFilterTextOnBlur: true,
				placeholder: 'Select category',
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.INPUT,
			props: {
				label: 'Results Stage Raw',
				name: 'results_stage',
				value: data?.results_stage,
			},
		},
		{
			type: COMPONENT_TYPES.ROOT_SELECT_BOX,
			props: {
				label: 'Results Stage Root',
				name: 'results_stage_data',
				placeholder: 'Select Results Stage Root',
				loadOptions: fetchSelectRootsSynonymsByLabel(
					ROOT_LABELS.RESULTS_STAGE
				),
				value: data?.results_stage_data,
				itemId: 'id',
				createLabelType: ROOT_LABELS.RESULTS_STAGE,
				allowCreate: true,
			},
		},
		{
			type: COMPONENT_TYPES.SEGMENT_PILL,
			props: {
				label: 'Verification Status',
				name: 'verification_status',
				value: data?.verification_status,
				items: Object.values(VERIFICATION_STATUS).map((key) => {
					return {
						label: transformSnakeToCapitalized(key),
						value: key,
					};
				}),
				required: true,
			},
		},
		{
			type: COMPONENT_TYPES.TEXTAREA,
			props: {
				label: 'Comment',
				placeholder: 'Enter a comment',
				value: data?.comment,
				name: 'comment',
				width: '100%',
			},
		},
		{
			type: COMPONENT_TYPES.BUTTON,
			props: [
				{
					name: 'Save',
					type: 'primary',
					buttonType: 'submit',
				},
			],
		},
	];

	onMount(async () => {
		await fetchReadoutData();
	});

	const fetchReadoutData = async () => {
		try {
			loader.show();
			let queryParams = { overall_status: true };
			const response = await fetchReadout(readoutId, queryParams);
			data = response?.data || {};
			let meta = response?.meta || {};
			dispatch('EscalateOverallStatus', {
				readout:
					data.verification_status === VERIFICATION_STATUS.ESCALATED,
				Keywords: meta.escalated_readout_keyword,
				sudies: meta.escalated_readout_studies,
			});
			if (!isEmpty(data.results_stage_data)) {
				data.results_stage_data = {
					label: data.results_stage_data.name,
					value: data.results_stage_data.id,
					data: data.results_stage_data,
					id: data.results_stage_data.id,
				};
			}
			originalData = { ...data };
			url = data.verification_url ?? data.url;
		} catch (error) {
			data = null;
			toasts.error(error.message || 'An unexpected error occurred.');
			push('/readouts');
		} finally {
			loader.hide();
		}
	};

	// Remove new lines and trim
	const removeNewlines = (content) => {
		try {
			return content.replace(/\n/g, '').trim();
		} catch (e) {
			return content;
		}
	};

	const onUpdateHandler = async (e) => {
		const updatedData = e.detail;
		let isChanged = false;

		for (let key in updatedData) {
			if (
				removeNewlines(originalData[key]) ==
				removeNewlines(updatedData[key])
			) {
				delete updatedData[key];
			}
		}

		if ('results_stage_data' in updatedData) {
			updatedData['results_stage_root_id'] = isEmpty(
				updatedData['results_stage_data']
			)
				? null
				: updatedData['results_stage_data'];
			delete updatedData['results_stage_data'];
		}

		for (let key in updatedData) {
			if (originalData[key] !== updatedData[key]) {
				isChanged = true;
				break;
			}
		}

		if (!isChanged) {
			toasts.warn('No changes to update.');
			return;
		}

		try {
			loader.show();
			await updateReadout(readoutId, updatedData);
			await fetchReadoutData();
			dispatch('RefreshAuditLog');
			toasts.success('Readout updated successfully');
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	};
</script>

{#if data}
	<DynamicForm
		{config}
		columns={4}
		fullWidth={true}
		on:submit={onUpdateHandler}
	/>
{/if}

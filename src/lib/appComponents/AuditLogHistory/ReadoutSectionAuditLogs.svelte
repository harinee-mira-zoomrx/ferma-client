<script>
	import { onMount } from 'svelte';
	import CircularLoader from '@components/CircularLoader/index.svelte';
	import {
		AUDITLOG_ACTIONS,
		deleteLog,
		insertLog,
		processChanges,
		loadAuditLog,
	} from '@models/AuditLogs/auditLog.js';
	import isEmpty from '@utils/is-empty';
	import { slide } from 'svelte/transition';
	import {
		transformSnakeToCapitalized,
		transformToTitleCase,
	} from '@utils/utility';
	import { READOUTS_SECTION_TYPE } from '@models/readoutsSections.js';
	import TitleDataGenerator from '@models/AuditLogs/titleGeneratorAuditLog';

	export let entity;
	export let entityId;
	export let tableName;
	export let columnFilter = '';

	let auditLogs = [];
	let processedLogs = [];
	let loading = false;

	const generator = new TitleDataGenerator(entityId);

	const loadAudit = async () => {
		loading = true;
		auditLogs = await loadAuditLog(
			entity,
			entityId,
			tableName,
			columnFilter
		);
		processLogs();
		loading = false;
	};

	onMount(() => {
		loadAudit();
	});

	const processLogs = () => {
		processedLogs = [];
		let year = new Date().getFullYear();

		for (const log of auditLogs) {
			const logDate = new Date(log.modified_at);
			const logYear = logDate.getFullYear();
			const formattedDate = logDate.toLocaleString('en-US', {
				month: 'short',
				day: '2-digit',
			});
			if (logYear !== year) {
				processedLogs.push({ type: 'year', year });
				year = logYear;
			}

			if (log.action === AUDITLOG_ACTIONS.INSERT) {
				processedLogs.push(insertLog(generator, log, formattedDate));
			} else if (log.action === AUDITLOG_ACTIONS.UPDATE) {
				const updateEntry = {
					type: 'update-group',
					table_name: log.table_name,
					date: formattedDate,
					action: log.action,
					triggeredBy: log.triggered_by,
					title: generator.generateTitleData(
						log.table_name,
						log.new_value
					),
					changes: [],
					section_type: null,
				};
				const ignoredAttributes = [
					'created_at',
					'modified_at',
					'readout_id',
					'content_type',
					'section_type',
				];

				updateEntry['section_type'] = log.new_value?.section_type;

				const allKeys = new Set([
					...Object.keys(log.new_value || {}),
					...Object.keys(log.old_value || {}),
				]);

				const keyMapping = {
					section_content: 'Section Content',
					section_summary: 'Section Summary',
				};

				let allChanges = [];

				for (const key of allKeys) {
					if (ignoredAttributes.includes(key)) continue;

					const newValue = log.new_value?.[key];
					const oldValue = log.old_value?.[key];
					const titleKey = keyMapping[key] || key;

					if (
						[
							READOUTS_SECTION_TYPE.EFFICACY,
							READOUTS_SECTION_TYPE.SAFETY,
						].includes(updateEntry['section_type'])
					) {
						if (key === 'section_content') {
							const maxLength = Math.max(
								newValue?.length,
								oldValue?.length
							);

							for (let i = 0; i < maxLength; i++) {
								const { changes, deletions } = processChanges(
									updateEntry['section_type'],
									oldValue?.[i],
									newValue?.[i]
								);
								allChanges.push(...changes);
								deletions.forEach(
									(subKey) =>
										delete updateEntry.title[
											'Section Content'
										][i][subKey]
								);
							}
						} else if (key === 'section_summary') {
							const { changes, deletions } = processChanges(
								updateEntry['section_type'],
								oldValue,
								newValue,
								titleKey
							);
							allChanges.push(...changes);
							deletions.forEach(
								(subKey) =>
									delete updateEntry.title[titleKey][subKey]
							);
						}
					} else {
						const { changes, deletions } = processChanges(
							updateEntry['section_type'],
							oldValue,
							newValue,
							titleKey
						);
						allChanges.push(...changes);
						deletions.forEach(
							(subKey) =>
								delete updateEntry.title[titleKey][subKey]
						);
					}
				}

				updateEntry.changes = allChanges;
				processedLogs.push(updateEntry);
			} else if (log.action === AUDITLOG_ACTIONS.DELETE) {
				processedLogs.push(deleteLog(generator, log, formattedDate));
			}
		}
	};
</script>

{#if loading}
	<div class="audit-log-loader">
		<CircularLoader />
	</div>
{:else if !processedLogs.length}
	<div class="audit-log-empty">No audit logs available to show.</div>
{:else}
	<div class="audit-log" transition:slide>
		{#each processedLogs as log}
			{#if log.type === 'year'}
				<div class="audit-log__year">{log.year}</div>
			{:else if log.type === 'insert' || log.type === 'delete'}
				{@const actionClass = `badge--${log.type}`}
				{@const actionLabel = log.type === 'insert' ? 'New' : 'Deleted'}
				{@const valueClass =
					log.type === 'insert'
						? 'audit-log__text-blue'
						: 'audit-log__text-red'}
				<div class="audit-log__entry">
					<span class="audit-log__date">{log.date}</span>
					<span class={`audit-log__action badge ${actionClass}`}
						>{actionLabel}</span
					>
					<span>
						{#each Object.entries(log.data) as [key, value], i (key)}
							{#if [READOUTS_SECTION_TYPE.BACKGROUND, READOUTS_SECTION_TYPE.CONCLUSION].includes(log.data['Section Type'])}
								<div>
									{key}
									<span class={valueClass}>{value}</span>
								</div>
							{:else if log.data['Section Type'] === READOUTS_SECTION_TYPE.STUDY_DESIGN}
								<div>
									{#if typeof value === 'object' && value !== null}
										{key}
										{#each Object.entries(value) as [subKey, subValue]}
											<div>
												{transformToTitleCase(subKey)} -
												<span class={valueClass}
													>{subValue}</span
												>
											</div>
										{/each}
									{:else if value !== null}
										{key}
										<span class={valueClass}>{value}</span>
									{/if}
								</div>
							{:else if [READOUTS_SECTION_TYPE.EFFICACY, READOUTS_SECTION_TYPE.SAFETY].includes(log.data['Section Type'])}
								<div>
									{#if value !== null}
										{#if typeof value === 'string'}
											{key}
											<span class={valueClass}
												>{value}</span
											>
										{:else if Array.isArray(value)}
											{key}
											{#each value as entryValue, entryIndex}
												<div>
													{`Entry ${entryIndex + 1}:`}
												</div>
												{#each Object.entries(entryValue) as [subKey, subValue]}
													<div>
														{transformToTitleCase(
															subKey
														)} -
														<span class={valueClass}
															>{subValue}</span
														>
													</div>
												{/each}
											{/each}
										{:else if typeof value === 'object' && !isEmpty(value)}
											{key}
											{#each Object.entries(value) as [subKey, subValue]}
												<div>
													{transformToTitleCase(
														subKey
													)} -
													<span class={valueClass}
														>{subValue}</span
													>
												</div>
											{/each}
										{/if}
									{/if}
								</div>
							{/if}
						{/each}
					</span>
					<span class="audit-log__triggered-by"
						>by {log.triggeredBy}</span
					>
				</div>
			{:else if log.type === 'update-group'}
				<div class="audit-log__entry update-group">
					<span class="audit-log__date">{log.date}</span>
					<span class="audit-log__action badge badge--update"
						>{log.action}</span
					>
					<span>
						{#if !isEmpty(log.title)}
							<div class="audit-log__title">
								{#if [READOUTS_SECTION_TYPE.BACKGROUND, READOUTS_SECTION_TYPE.CONCLUSION].includes(log.section_type)}
									{#each Object.entries(log.title) as [key, value]}
										<div>
											{key}
											<b>{value}</b>
										</div>
									{/each}
								{:else if log.section_type === READOUTS_SECTION_TYPE.STUDY_DESIGN}
									{#each Object.entries(log.title) as [key, value]}
										<div>
											{#if typeof value === 'object'}
												{#if value !== null && !isEmpty(value)}
													{key}
													{#each Object.entries(value) as [subKey, subValue]}
														<div>
															{transformToTitleCase(
																subKey
															)} -
															<b>{subValue}</b>
														</div>
													{/each}
												{/if}
											{:else if value !== null}
												{key}
												<b>{value}</b>
											{/if}
										</div>
									{/each}
								{:else if [READOUTS_SECTION_TYPE.EFFICACY, READOUTS_SECTION_TYPE.SAFETY].includes(log.section_type)}
									{#each Object.entries(log.title) as [key, value]}
										<div>
											{#if value !== null}
												{#if typeof value === 'string'}
													{key}
													<b>{value}</b>
												{:else if Array.isArray(value) && !isEmpty(value)}
													{key}
													{#each value as entryValue, entryIndex}
														<div>
															{#if !isEmpty(entryValue)}
																{`Entry ${entryIndex + 1}`}
															{/if}
														</div>
														{#if !isEmpty(entryValue)}
															{#each Object.entries(entryValue) as [subKey, subValue]}
																<div>
																	{subKey} -
																	<b
																		>{subValue}</b
																	>
																</div>
															{/each}
														{/if}
													{/each}
												{:else if typeof value === 'object' && !isEmpty(value)}
													{key}
													{#each Object.entries(value) as [subKey, subValue]}
														<div>
															{transformToTitleCase(
																subKey
															)} -
															<span
																>{subValue}</span
															>
														</div>
													{/each}
												{/if}
											{/if}
										</div>
									{/each}
								{/if}
							</div>
						{/if}
						{#each log.changes as change}
							<div class="audit-log__subentry">
								<div>
									<span
										>{transformSnakeToCapitalized(
											change.attribute
										)}</span
									>
									{#if !isEmpty(change.oldValue)}
										from
										<span class="audit-log__old-value"
											>{change.oldValue}</span
										>
										to
									{/if}
									<span class="audit-log__new-value"
										>{change.newValue}</span
									>
								</div>
								<div>
									<span class="audit-log__triggered-by"
										>by {log.triggeredBy}</span
									>
								</div>
							</div>
						{/each}
					</span>
				</div>
			{/if}
		{/each}
	</div>
{/if}

<style src="./style.scss"></style>

<script>
	import { onMount } from 'svelte';
	import CircularLoader from '@components/CircularLoader/index.svelte';
	import {
		deleteLog,
		insertLog,
		mergeLog,
		loadAuditLog,
	} from '@models/AuditLogs/auditLog';
	import { AUDITLOG_ACTIONS } from '@models/AuditLogs/auditLog';
	import { TABLE_NAME } from '@utils/constants';
	import isEmpty from '@utils/is-empty';
	import { slide } from 'svelte/transition';
	import { transformSnakeToCapitalized } from '@utils/utility';
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
					date: formattedDate,
					action: log.action,
					triggeredBy: log.triggered_by,
					title: generator.generateTitleData(
						log.table_name,
						log.new_value
					),
					changes: [],
				};
				const ignoredAttributes = [
					'created_at',
					'modified_at',
					'root_id',
					'acronym_root_id',
					'brand_root_id',
					'target_root_id',
					'drug_class_root_id',
					'active_ingredient_root_id',
					'disease_root_id',
					'indication_md5_hash',
					'organization_root_id',
					'value_root_id',
					'parent_root_id',
					'child_root_id',
				];

				const allKeys = new Set([
					...Object.keys(log.new_value || {}),
					...Object.keys(log.old_value || {}),
				]);

				const formatValue = (value) =>
					typeof value === 'object' && value !== null
						? JSON.stringify(value, null, 2)
						: value;

				for (const key of allKeys) {
					if (ignoredAttributes.includes(key)) continue;

					const newValue = log.new_value?.[key];
					const oldValue = log.old_value?.[key];

					if (oldValue !== undefined && newValue === undefined) {
						updateEntry.changes.push({
							attribute: key,
							oldValue: formatValue(oldValue),
							newValue: 'null',
						});
					} else if (
						newValue !== undefined &&
						oldValue === undefined
					) {
						updateEntry.changes.push({
							attribute: key,
							oldValue: 'null',
							newValue: formatValue(newValue),
						});
					} else if (
						formatValue(newValue) !== formatValue(oldValue)
					) {
						updateEntry.changes.push({
							attribute: key,
							oldValue: formatValue(oldValue),
							newValue: formatValue(newValue),
						});
					}
				}

				let excludetitleForTables = [
					TABLE_NAME.ROOTS,
					TABLE_NAME.TRIALS,
					TABLE_NAME.ORGANIZATIONS,
					TABLE_NAME.READOUTS,
				];

				if (excludetitleForTables.includes(log.table_name)) {
					updateEntry.title = {};
				}

				processedLogs.push(updateEntry);
			} else if (log.action === AUDITLOG_ACTIONS.MERGE) {
				processedLogs.push(mergeLog(log, formattedDate));
			} else if (
				log.action === AUDITLOG_ACTIONS.DELETE ||
				log.action === AUDITLOG_ACTIONS.INVALID
			) {
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
			{:else if log.type === 'insert'}
				<div class="audit-log__entry">
					<span class="audit-log__date">{log.date}</span>
					<span class="audit-log__action badge badge--insert"
						>{log.action}</span
					>
					<span>
						{#each Object.entries(log.data) as [key, value], i (key)}
							{key}
							<span class="audit-log__text-blue">{value}</span>
							{#if i < Object.keys(log.data).length - 1}
								and{' '}
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
								{#each Object.entries(log.title) as [key, value], i (key)}
									{key}
									<b>{value}</b>
									{#if i < Object.keys(log.title).length - 1}
										and{' '}{/if}
								{/each}
								,
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
			{:else if log.type === 'merge'}
				<div class="audit-log__entry">
					<span class="audit-log__date">{log.date}</span>
					<span class="audit-log__action badge badge--merge"
						>{log.action}</span
					>
					<span
						><b>{log.oldName}</b> with
						<span class="audit-log__text-blue">{log.newName}</span
						></span
					>
					<span class="audit-log__triggered-by"
						>by {log.triggeredBy}</span
					>
				</div>
			{:else if log.type === 'delete'}
				<div class="audit-log__entry">
					<span class="audit-log__date">{log.date}</span>
					<span class="audit-log__action badge badge--delete"
						>{log.action}</span
					>
					<span>
						{#each Object.entries(log.data) as [key, value], i (key)}
							{key}
							<span class="audit-log__text-red">{value}</span>
							{#if i < Object.keys(log.data).length - 1}
								and {' '}
							{/if}
						{/each}
					</span>
					<span class="audit-log__triggered-by"
						>by {log.triggeredBy}</span
					>
				</div>
			{/if}
		{/each}
	</div>
{/if}

<style src="./style.scss"></style>

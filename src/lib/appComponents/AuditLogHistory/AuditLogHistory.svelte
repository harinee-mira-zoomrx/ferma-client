<script>
	import Accordion from '@components/Accordion/Accordion.svelte';
	import AuditLogs from './AuditLogs.svelte';
	import { TABLE_NAME } from '@utils/constants.js';
	import ReadoutSectionAuditLogs from '@appComponents/AuditLogHistory/ReadoutSectionAuditLogs.svelte';

	export let entity;
	export let entityId;
	export let tableName;
	export let columnFilter = '';
	export let open;
</script>

<div class="audit-log-history">
	<Accordion {open}>
		<div class="audit-log-history__header" slot="header">Audit log</div>
		<div class="audit-log-history__container" slot="details">
			{#if tableName ===  TABLE_NAME.READOUTS_SECTIONS}
				<ReadoutSectionAuditLogs {entity} {entityId} {tableName} {columnFilter} />
			{:else}
				<AuditLogs {entity} {entityId} {tableName} {columnFilter} />
			{/if}
		</div>
	</Accordion>
</div>

<style src="./style.scss"></style>

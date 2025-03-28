<script>
	import PageContainer from '@components/PageContainer/PageContainer.svelte';
	import Tab from '@components/Tab/Tab.svelte';
	import EditReadout from '@appComponents/Readouts/EditReadout.svelte';
	import ReadoutKeywords from '@appComponents/Readouts/ReadoutKeywords/ReadoutKeywords.svelte';
	import ReadoutSections from '@appComponents/ReadoutSections/ReadoutSections.svelte';
	import ReadoutStudies from '@appComponents/Readouts/ReadoutStudies/ReadoutStudies.svelte';
	import AuditLogHistory from '@appComponents/AuditLogHistory/AuditLogHistory.svelte';
	import { PARENT_ENTITIES } from '@models/AuditLogs/auditLog.js';
	import { TABLE_NAME } from '@utils/constants';
	import { CONTENT_TYPE } from '@models/readoutsSections.js';


	export let params = {};
	let verificationUrl = null;

	let ReadoutTabs = [
		{
			label: 'Readout',
			value: 'readout',
			component: EditReadout,
			showWarning: false,
			tableName: TABLE_NAME.READOUTS,
		},
		{
			label: 'Abstract',
			value: 'Abstract',
			component: ReadoutSections,
			props: {
				contentType: CONTENT_TYPE.ABSTRACT
			},
			showWarning: false,
			tableName: TABLE_NAME.READOUTS_SECTIONS
		},
		{
			label: 'Content',
			value: 'Content',
			component: ReadoutSections,
			props: {
				contentType: CONTENT_TYPE.CONTENT
			},
			showWarning: false,
			tableName: TABLE_NAME.READOUTS_SECTIONS
		},
		{
			label: 'Keywords',
			value: 'Keywords',
			component: ReadoutKeywords,
			showWarning: false,
			tableName: TABLE_NAME.READOUTS_KEYWORDS
		},
		{
			label: 'Studies',
			value: 'sudies',
			component: ReadoutStudies,
			tableName: TABLE_NAME.READOUTS_STUDIES
		},
	];
	let activeTab = ReadoutTabs[0];
	let refreshAuditlogHistory = 1;

	const handleEscalateOverallStatus = (event) => {
		let overallStatus = event.detail;
		if (overallStatus.hasOwnProperty('readout')) {
			ReadoutTabs[0].showWarning = overallStatus.readout;
		}
		if (overallStatus.hasOwnProperty('Keywords')) {
			ReadoutTabs[1].showWarning = overallStatus.Keywords;
		}
		if (overallStatus.hasOwnProperty('sudies')) {
			ReadoutTabs[2].showWarning = overallStatus.sudies;
		}
	}

	const handleRefreshAuditLog = () => {
		++refreshAuditlogHistory;
	}

</script>

<PageContainer title='Readout ID - {verificationUrl ? `<a href=${verificationUrl} target="_blank">${params.id}</a>`: params.id}'>
	<svelte:fragment slot="content">
		<div class="readouts">
			<div class="readouts__tab">
				<Tab tabs={ReadoutTabs} bind:activeTab onClick={handleRefreshAuditLog}/>
			</div>
			<div class="readouts__content">
				{#key activeTab.value}
					{#if activeTab.value === 'readout'}
						<EditReadout
							readoutId={params.id}
							bind:url={verificationUrl}
						/>
					{:else}
						<svelte:component
							this={activeTab.component}
							readoutId={params.id}
							{...activeTab.props}
							on:EscalateOverallStatus={handleEscalateOverallStatus}
							on:RefreshAuditLog={handleRefreshAuditLog}
						/>
					{/if}
				{/key}
			</div>
		</div>
		{#if activeTab.tableName}
			{#key refreshAuditlogHistory}
				<AuditLogHistory
					entity={PARENT_ENTITIES.READOUT}
					entityId={params.id}
					tableName={activeTab.tableName}
					columnFilter={activeTab.tableName === TABLE_NAME.READOUTS_SECTIONS
									? `content_type:${activeTab.value.toUpperCase()}`
									: undefined}
					open={false}
				/>
			{/key}
		{/if}
	</svelte:fragment>
</PageContainer>

<style src="./style.scss"></style>

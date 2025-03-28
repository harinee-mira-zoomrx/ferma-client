<script>
	import PageContainer from '@components/PageContainer/PageContainer.svelte';
	import Tab from '@components/Tab/Tab.svelte';
	import EditTrials from '@appComponents/Trials/EditTrials.svelte';
	import DrugStudies from '@appComponents/DrugStudies/DrugStudies.svelte';
	import DiseaseStudies from '@appComponents/DiseaseStudies/DiseaseStudies.svelte';
	import OrganizationStudies from '@appComponents/OrganizationStudy/OrganizationStudies.svelte';
	import ReadoutStudies from '@appComponents/Readouts/ReadoutStudies/ReadoutStudies.svelte';
	import AuditLogHistory from '@appComponents/AuditLogHistory/AuditLogHistory.svelte';
	import { PARENT_ENTITIES } from '@models/AuditLogs/auditLog';
	import { TABLE_NAME } from '@utils/constants';

	export let params = {};

	$: trial = null;

	let studiesTabs = [
		{
			label: 'Trials',
			value: 'trials',
			component: EditTrials,
			showWarning: false,
			tableName: [TABLE_NAME.TRIALS],
		},
		{
			label: 'Drugs Studies',
			value: 'drugs_studies',
			component: DrugStudies,
			showWarning: false,
			tableName: [TABLE_NAME.DRUGS_STUDIES],
		},
		{
			label: 'Diseases Studies',
			value: 'diseases_studies',
			component: DiseaseStudies,
			showWarning: false,
			tableName: [TABLE_NAME.DISEASES_STUDIES],
		},
		{
			label: 'Organizations Studies',
			value: 'organizations_studies',
			component: OrganizationStudies,
			showWarning: false,
			tableName: [TABLE_NAME.ORGANIZATIONS_STUDIES],
		},
		{
			label: 'Readout Studies',
			value: 'readout_studies',
			component: ReadoutStudies,
			showWarning: false,
		},
	];
	let activeTab = studiesTabs[0];
	let refreshAuditlogHistory = 1;

	const handleEscalateOverallStatus = (event) => {
		let overallStatus = event.detail;
		if (overallStatus.hasOwnProperty('trials')) {
			studiesTabs[0].showWarning = overallStatus.trials;
		}
		if (overallStatus.hasOwnProperty('drugs_studies')) {
			studiesTabs[1].showWarning = overallStatus.drugs_studies;
		}
		if (overallStatus.hasOwnProperty('diseases_studies')) {
			studiesTabs[2].showWarning = overallStatus.diseases_studies;
		}
		if (overallStatus.hasOwnProperty('organizations_studies')) {
			studiesTabs[3].showWarning = overallStatus.organizations_studies;
		}
		if (overallStatus.hasOwnProperty('readout_studies')) {
			studiesTabs[4].showWarning = overallStatus.readout_studies;
		}
	}

	const handleTrialDetailChange = (event) => {
		trial = event.detail;
	};

	const handleRefreshAuditLog = () => {
		++refreshAuditlogHistory;
	}

</script>

<PageContainer>
	<svelte:fragment slot="content">
		<div class="studies">
			<div class="studies__header">
				{params.nct_id}
			</div>
			<div class="studies__tab">
				<Tab tabs={studiesTabs} bind:activeTab onClick={handleRefreshAuditLog}/>
			</div>
			{#if activeTab && activeTab.component}
				<div class="studies__content">
				<svelte:component
					this={activeTab.component}
					nctId={params.nct_id}
					{trial}
					{...activeTab.props}
					on:EscalateOverallStatus={handleEscalateOverallStatus}
					on:TrialDetailChange={handleTrialDetailChange}
					on:RefreshAuditLog={handleRefreshAuditLog}
				/>
				</div>
			{/if}
		</div>
		{#if activeTab.tableName && trial?.study_id}
			{#key refreshAuditlogHistory}
				<AuditLogHistory entity={PARENT_ENTITIES.STUDY} entityId={trial.study_id} tableName={activeTab.tableName} open={false}/>
			{/key}
		{/if}
	</svelte:fragment>
</PageContainer>


<style src="./style.scss"></style>

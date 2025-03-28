<script>
	import Selectbox from '@components/Selectbox/Selectbox.svelte';
	import PageContainer from '@components/PageContainer/PageContainer.svelte';
	import { fetchSelectRootsSynonymsByLabel } from '@models/roots';
	import Organization from '@appComponents/Organization/Organization.svelte';
	import AuditLogHistory from '@appComponents/AuditLogHistory/AuditLogHistory.svelte';
	import { PARENT_ENTITIES } from '@models/AuditLogs/auditLog';
	import { TABLE_NAME } from '@utils/constants';

	let selectedOrganization;
	let refreshData = 1;
	let refreshAuditlogHistory = 1;
</script>

<PageContainer title="Organizations">
	<div slot="header">
		<div class="organization__header">
			<Selectbox
				placeholder="Select organization"
				label="Organization"
				bind:value={selectedOrganization}
				loadOptions={fetchSelectRootsSynonymsByLabel('Organization')}
				onInput={() => {
					refreshData += 1;
				}}
				clearable={true}
			/>
		</div>
	</div>
	<svelte:fragment slot="content">
		{#if selectedOrganization}
			{#key refreshData}
				<div class="organization">
					<div class="organization__content">
						<Organization
							organization={selectedOrganization}
							on:RefreshAuditLog={() => ++refreshAuditlogHistory}
						/>
					</div>
				</div>
				{#key refreshAuditlogHistory}
					<AuditLogHistory
						entity={PARENT_ENTITIES.ROOT}
						entityId={selectedOrganization.id}
						tableName={[TABLE_NAME.ORGANIZATIONS]}
						open={false}
					/>
				{/key}
			{/key}
		{/if}
	</svelte:fragment>
</PageContainer>

<style src="./style.scss"></style>

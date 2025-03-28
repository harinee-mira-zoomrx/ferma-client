<script>
	import { onMount, onDestroy } from 'svelte';
	import PageContainer from '@components/PageContainer/PageContainer.svelte';
	import Tab from '@components/Tab/Tab.svelte';
	import Root from '@appComponents/Root/Root.svelte';
	import Synonyms from '@appComponents/Synonyms/Synonyms.svelte';
	import { RELATIONSHIP_MAPPING } from '@models/relationships';
	import RootRelationship from '@appComponents/RootRelationship/RootRelationship.svelte';
	import RootLandscape from '@appComponents/RootLandscape/RootLandscape.svelte';
	import isEmpty from '@utils/is-empty';
	import IconButton from '@smui/icon-button';
	import Button from '@components/Button/Button.svelte';
	import InvalidateRoot from '@appComponents/Root/InvalidateRoot.svelte';
	import { authorization } from '@stores/authorization.store';
	import AuditLogHistory from '@appComponents/AuditLogHistory/AuditLogHistory.svelte';
	import { PARENT_ENTITIES } from '@models/AuditLogs/auditLog';
	import { TABLE_NAME } from '@utils/constants';

	export let params = {};

	let actionsElement = null;
	let actionsExpanded = false;
	let showInvalidateModal = false;
	let hasInvalidPendingAction = false;
	let { permissions } = $authorization;
	let refreshRoot = 1;
	let refreshAuditlogHistory = 1;

	$: root = null;

	let rootTabs = [
		{
			label: 'Roots',
			value: 'root',
			component: Root,
			showWarning: false,
			tableName: [TABLE_NAME.ROOTS, TABLE_NAME.PENDING_ACTIONS],
		},
		{
			label: 'Synonyms',
			value: 'synonyms',
			component: Synonyms,
			showWarning: false,
			tableName: [TABLE_NAME.SYNONYMS],
		},
		{
			label: 'Relationship',
			value: 'relationship',
			component: RootRelationship,
			hide: (root?.label && !RELATIONSHIP_MAPPING[root.label]) || true,
			showWarning: false,
			tableName: [TABLE_NAME.RELATIONSHIPS],
		},
		{
			label: 'Landscape',
			value: 'landscape',
			component: RootLandscape,
			showWarning: false,
		},
	];
	let activeTab = rootTabs[0];

	const handleClickOutsideActionsElement = (event) => {
		if (actionsElement && !actionsElement.contains(event.target)) {
			actionsExpanded = false;
		}
	};

	const handleRootDetailChange = (event) => {
		root = event.detail;
		rootTabs[2].hide = !RELATIONSHIP_MAPPING[root.label];
	};

	const handleEscalateOverallStatus = (event) => {
		let overallStatus = event.detail;
		if (overallStatus.hasOwnProperty('root')) {
			rootTabs[0].showWarning = overallStatus.root;
		}
		if (overallStatus.hasOwnProperty('synonyms')) {
			rootTabs[1].showWarning = overallStatus.synonyms;
		}
		if (overallStatus.hasOwnProperty('relationship')) {
			rootTabs[2].showWarning = overallStatus.relationship;
		}
	}

	const handleInvalidPendingAction = (event) => {
		hasInvalidPendingAction = event.detail;
	};

	const handleRefreshAuditLog = () => {
		++refreshAuditlogHistory;
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutsideActionsElement);
	});

	onDestroy(() => {
		document.removeEventListener('click', handleClickOutsideActionsElement);
	});
</script>

<PageContainer>
	<svelte:fragment slot="content">
		<div class="root">
			<div class="root__header">
				<div class="root__header-title">
					{#if !isEmpty(root)}
						{root?.name} ({root?.id})
					{/if}
				</div>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				{#if !hasInvalidPendingAction}
					<div
						class="root__header-actions"
						bind:this={actionsElement}
						on:click|stopPropagation
					>
						<div class="root__header-actions-title">
							<IconButton
								class="material-icons"
								title="More Actions"
								ripple={false}
								on:click={() => {
									actionsExpanded = !actionsExpanded;
								}}
							>
								more_vert
							</IconButton>
						</div>
						{#if actionsExpanded}
							<div class="root__header-actions-content">
								<Button
									type="cautious-primary"
									onClick={() => {
										showInvalidateModal = true;
										actionsExpanded = false;
									}}
								>
									Invalidate
								</Button>
							</div>
						{/if}
					</div>
				{/if}
			</div>
			{#key refreshRoot}
				<div class="root__tab">
					<Tab tabs={rootTabs} bind:activeTab onClick={handleRefreshAuditLog}/>
				</div>
				<div class="root__content">
					<svelte:component
						this={activeTab.component}
						rootId={params.id}
						{root}
						{...activeTab.props}
						on:RootDetailChange={handleRootDetailChange}
						on:InvalidPendingAction={handleInvalidPendingAction}
						on:EscalateOverallStatus={handleEscalateOverallStatus}
						on:RefreshAuditLog={handleRefreshAuditLog}
					/>
				</div>
			{/key}
		</div>
		{#if activeTab.tableName}
			{#key refreshAuditlogHistory}
				<AuditLogHistory entity={PARENT_ENTITIES.ROOT} entityId={params.id} tableName={activeTab.tableName} open={false}/>
			{/key}
		{/if}
	</svelte:fragment>
</PageContainer>

{#if showInvalidateModal}
	<InvalidateRoot
		{root}
		isLeadUser={permissions.canInvalidateRoot}
		onClose={() => {
			showInvalidateModal = false;
		}}
		on:invalidateRoot={() => {
			refreshRoot  = refreshRoot + 1;
			showInvalidateModal = false;
		}}
	/>
{/if}

<style src="./style.scss"></style>

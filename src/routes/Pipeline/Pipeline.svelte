<script>
	import PageContainer from '@components/PageContainer/PageContainer.svelte';
	import Tab from '@components/Tab/Tab.svelte';
	import Tasks from '@appComponents/Tasks/Tasks.svelte';
	import Workflow from '@appComponents/Workflow/Workflow.svelte';
	import Prompt from '@appComponents/Prompt/Prompt.svelte';

	let refreshRoot = 1;
	let pipelineTabs = [
		{
			label: 'Tasks',
			value: 'task',
			component: Tasks,
		},
		{
			label: 'Workflow',
			value: 'workflow',
			component: Workflow,
		},
		{
			label: 'Prompt',
			value: 'prompt',
			component: Prompt,
		},
	];
	let activeTab = pipelineTabs[0];
</script>

<PageContainer>
	<svelte:fragment slot="content">
		<div class="pipeline">
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			{#key refreshRoot}
				<div class="pipeline__tab">
					<Tab tabs={pipelineTabs} bind:activeTab />
				</div>
				<div class="pipeline__content">
					<svelte:component
						this={activeTab.component}
						{...activeTab.props}
					/>
				</div>
			{/key}
		</div>
	</svelte:fragment>
</PageContainer>

<style lang="scss">
	.pipeline {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		flex-direction: column;

		&__content {
			width: 100%;
			background: #fff;
			padding: 30px;
			border: 1px solid rgb(0, 0, 0, 0.2);
			border-radius: 10px;
		}
		&__tab {
			padding: 0 10px;
			align-self: flex-start;
		}
	}
</style>

<script>
// @ts-nocheck

	import PageContainer from '@components/PageContainer/PageContainer.svelte';
	import KgWorkflow from '@appComponents/DataReviewer/KGWorkflow/KGWorkflow.svelte';
	import DrugsWorkflow from '@appComponents/DataReviewer/DrugsWorkflow/DrugsWorkflow.svelte';
    import { location, push } from 'svelte-spa-router';
	import { Icon } from '@smui/icon-button';
	import { refreshTable } from '@stores/workflow.store';

    export let params = {};

    $: from = $location.includes('trials')? 'trials': $location.includes('firms')? 'firms' : ''; 

    const goBack = () => {
       const route = `/data-reviewer/${from}-workflow/default`;
	   push(route);
	}
</script>

<PageContainer title="{from} Workflow">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div slot="header" class="header-back-btn" on:click={goBack}>
		<Icon class="material-icons mdc-icon-button mdc-icon-button--display-flex header-back-btn-icon">
			arrow_back_ios
		</Icon>
		Back
	</div>
	<svelte:fragment slot="content">
		<div class="kg-workflow">
			<h2>Insight Attributes</h2>
			<KgWorkflow {from} insightId = {params?.id} on:refreshTable={()=> {
				refreshTable.set(true);
			}}/>
		</div>
		<div class="drugs-workflow">
			<h2>Insight Relationships</h2>
			<DrugsWorkflow {from} insightId = {params?.id}/>
		</div>
	</svelte:fragment>
</PageContainer>

<style>
	h2 {
		font-size: 20px;
		font-weight: 400;
		color: #565656;
		margin-bottom: 10px;
	}
	.header-back-btn {
		position: fixed;
		z-index: 1;
    	top: 20px;
    	right: 30px;
		display: flex;
    	align-items: center;
    	justify-content: right;
    	cursor: pointer;
		width: fit-content;
		margin-left: auto;
		&:hover {
			font-weight: 500;
		}
	}
</style>

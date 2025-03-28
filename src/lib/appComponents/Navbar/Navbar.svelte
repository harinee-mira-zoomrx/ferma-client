<script>
	// @ts-ignore
	import fermaSvg from '@svg/ferma.svg';
	import { logout } from '@models/user';
	// @ts-ignore
	import signOut from '@svg/sign-out.svg';
	import { toasts } from '@components/Toast/toasts';
	import { loader } from '@components/Loader/Loader';
	import Item from './Item/Item.svelte';
	import Submenu from './Submenu/Submenu.svelte';
	import IconButton from '@smui/icon-button';

	let collapsed = false;

	const onLogout = async () => {
		try {
			await logout();			
		} catch (error) {
			toasts.error(error.message || 'An unexpected error occurred.');
		} finally {
			loader.hide();
		}
	};

	const toggleCollapse = (state = !collapsed) => {
		collapsed = state;
	};

	// Define menu items
	const mainItems = [
		{   path: '/roots',
			label: 'Roots',
			iconName: 'hub'
		},
		{
			path: '/trials',
			label: 'Clinical Trials',
			iconName: 'table_chart',
		},
		{
			path: '/preclinical-trials',
			label: 'Preclinical Studies',
			iconName: 'table_chart',
		},
		{
			path: '/approved-studies',
			label: 'Approved Studies',
			iconName: 'table_chart',
		},
		{
			path: '/organizations',
			label: 'Organizations',
			iconName: 'corporate_fare',
		},
		{
			path: '/readouts',
			label: 'Readouts',
			iconName: 'library_books',
			activePath: '/readouts/*',
		},
		{
			path: '/bulk-operations',
			label: 'Bulk Operations',
			iconName: 'format_list_bulleted_add',
		},
		{ path: '/pipeline', label: 'Pipeline', iconName: 'account_tree' },
		{
			path: '/invalid-terms',
			label: 'Invalid Terms',
			iconName: 'block',
		},
	];

	const submenuItems = [
		{ path: '/data-reviewer/contents', label: 'Contents' },
		{ path: '/data-reviewer/insights-master', label: 'Insights Master' },
		{ path: '/data-reviewer/kg-workflow', label: 'KG Workflow' },
		{
			path: '/data-reviewer/firms-workflow/default',
			label: 'Firms Workflow',
			activePath: '/data-reviewer/firms-workflow/*',
		},
		{ path: '/data-reviewer/drugs-workflow', label: 'Drugs Workflow' },
		{
			path: '/data-reviewer/trials-workflow/default',
			label: 'Trials Workflow',
			activePath: '/data-reviewer/trials-workflow/*',
		},
	];
</script>

<section class="sidebar {collapsed ? 'collapsed' : ''}">
	<div class="ferma-logo">
		{#if !collapsed}
			<img src={fermaSvg} alt="ferma logo" />
			<span>Support Portal</span>
		{/if}
		<IconButton
			class="material-icons"
			ripple={false}
			on:click={() => toggleCollapse()}
			>menu
		</IconButton>
	</div>

	<div class="nav">
		<div class="nav-items-container">
			{#each mainItems as { path, label, iconName, activePath }}
				<Item {path} {label} {iconName} {activePath} {collapsed} />
			{/each}
			<Submenu
				label="Data Reviewer"
				activePath="/data-reviewer/*"
				iconName="query_stats"
				{collapsed}
				setCollapsed={toggleCollapse}
			>
				{#each submenuItems as { path, label, activePath }}
					<Item {path} {label} {activePath} {collapsed} />
				{/each}
			</Submenu>
		</div>

		<div class="logout" on:click={onLogout}>
			<img src={signOut} alt="logout" />
			{#if !collapsed}
				<span>Logout</span>
			{/if}
		</div>
	</div>
</section>

<style src="./style.scss"></style>

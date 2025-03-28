<script>
	import isEmpty from '@utils/is-empty';
	export let data;
	export let href = null;
</script>

<!-- svelte-ignore a11y-missing-content -->
{#if isEmpty(data)}
	-
{:else}
	<a class="cell-link" href={href ? href : data} target="_blank">{data}</a>
{/if}

<style>
	.cell-link {
		color: #000000de;
	}

	.cell-link:visited,
	.cell-link:active,
	.cell-link:hover {
		color: #000000de;
	}
</style>

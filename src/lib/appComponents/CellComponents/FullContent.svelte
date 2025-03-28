<script>
	import isEmpty from "@utils/is-empty";
	export let data;
	export let column;
</script>

<!-- svelte-ignore a11y-missing-content -->
 {#if isEmpty(data)}
 	-
 {:else}
	<div class="full-content">{data}</div>
{/if}

<style>
.full-content{
    text-wrap: wrap;
    width: 100%;
}
</style>
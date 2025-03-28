<script>
	export let label = '';
	export let items = [];

	export let getHref;
</script>

<div class="link-list">
	{#if label}
		<div class="link-list__label">{label}</div>
	{/if}
	<div class="link-list__items">
		{#if items.length > 0}
			{#each items as item, i (item.id)}
				<a
					href={getHref(item)}
					target="_blank"
					rel="noopener noreferrer"
				>
					{item.name}
				</a>{i < items.length - 1 ? '; ' : ''}
			{/each}
		{:else}
			<span>None</span>
		{/if}
	</div>
</div>

<style lang="scss">
	.link-list {
		&__label {
			display: flex;
			align-self: flex-start;
			justify-content: flex-start;
			font-size: 12px;
			color: #8b8b8b;
		}

		&__items {
			a {
				color: #000000de;
			}

			a:visited,
			a:active,
			a:hover {
				color: #000000de;
			}
		}
	}
</style>

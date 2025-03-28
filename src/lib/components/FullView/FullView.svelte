<script>
	import Link from '@appComponents/CellComponents/Link.svelte';
	export let data = [];
	export let hrefPrefix = '';

	const renderValue = (id, label) => {
		return {
			component: Link,
			props: {
				data: label,
				href: `${hrefPrefix}${id}`,
			},
		};
	};

	const getIdAndLabel = (item) => {
		const [id, label] = Object.entries(item)[0];
		return { id, label };
	};
</script>

<div class="expanded-array">
	{#each data as item}
		{@const { id, label } = getIdAndLabel(item)}
		<div class="expanded-item">
			<svelte:component
				this={renderValue(id, label).component}
				{...renderValue(id, label).props}
			/>
		</div>
	{/each}
</div>

<style lang="scss">
	.expanded-array {
		display: flex;
		flex-direction: column;
		gap: 4px;
		width: 100%;
	}

	.expanded-item {
		display: flex;
		gap: 8px;
		margin-bottom: 4px;
		align-items: center;
	}

	.expanded-item:not(:last-child) {
		border: 0;
		border-bottom: 1px dashed #ddd;
	}
</style>

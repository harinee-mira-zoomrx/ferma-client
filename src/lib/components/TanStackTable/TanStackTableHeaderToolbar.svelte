<script>
	import IconButton from '@smui/icon-button';
	import TanStackColumnVisibility from './TanStackColumnVisibility.svelte';
	import Input from '@components/Input/Input.svelte';
	export let table;
</script>

<div class="datatable__header">
	<div class="header-left">
		{#if $table.options.enableGlobalFilter}
			<div class="global_search">
				<Input
					placeholder="Search"
					value={$table.getState().globalFilter}
					onInput={(e) => {
						$table.setGlobalFilter(e.currentTarget.value);
					}}
				/>
			</div>
		{/if}
		<slot name="table-actions-left"></slot>
	</div>
	<div class="datatable__header__buttons">
		<slot name="table-actions-right"></slot>
		<IconButton
			class="material-icons"
			title="Font Size"
			ripple={false}
			on:click={$table.toggleDensity()}
		>
			text_fields
		</IconButton>
		<TanStackColumnVisibility {table} />
	</div>
</div>

<style lang="scss">
	.datatable {
		&__header {
			--input-border-radius: 16px;

			display: flex;
			align-items: flex-end;
			justify-content: space-between;
			width: 100%;
			gap: 30px;

			.header-left {
				display: flex;
				align-items: center;
				justify-content: flex-start;
				gap: 15px;

				.global-search {
					min-width: 200px;
				}
				:global(.segment) {
					width: fit-content;
				}
			}
		}

		&__header__buttons {
			display: flex;
			align-items: flex-end;
			justify-content: space-between;
			gap: 10px;
		}
	}

	:global(:root) {
		--header-padding: 8px;
		--cell-padding: 8px;
	}

	:global([data-density='sm']) {
		--header-padding: 4px;
		--cell-padding: 4px;
	}

	:global([data-density='lg']) {
		--header-padding: 16px;
		--cell-padding: 16px;
	}
</style>

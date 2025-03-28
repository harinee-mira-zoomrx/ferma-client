<script>
	import IconButton from '@smui/icon-button';
	import { flip } from 'svelte/animate';
	import {
		dndzone,
		overrideItemIdKeyNameBeforeInitialisingDndZones,
	} from 'svelte-dnd-action';

	overrideItemIdKeyNameBeforeInitialisingDndZones('accessorKey');
	export let table;

	let showColumnList = false;
	const flipDurationMs = 300;
	const handleDnd = (e) => {
		$table.setColumnOrder(e.detail.items);
	};
</script>

<div class="visibility-order-column">
	<IconButton
		class="material-icons"
		title="Columns to show"
		ripple={false}
		on:click={() => {
			showColumnList = !showColumnList;
		}}
	>
		filter_alt
	</IconButton>

	{#if showColumnList}
		<div class="visibility-order-column__container">
			<section
				use:dndzone={{
					items: $table
						.getAllLeafColumns()
						.map((col) => col.columnDef),
					type: 'default',
				}}
				on:consider={handleDnd}
				on:finalize={handleDnd}
				class="rearrange-column__container"
			>
				{#each $table.getAllLeafColumns() as column (column.id)}
					<div animate:flip={{ duration: flipDurationMs }}>
						<input
							checked={column.getIsVisible()}
							on:change={column.getToggleVisibilityHandler()}
							type="checkbox"
						/>
						<span>{column.columnDef.header}</span>
					</div>
				{/each}
			</section>
		</div>
	{/if}
</div>

<style lang="scss">
	.rearrange-column__container:focus {
		outline: none;
	}

	.visibility-order-column {
		position: relative;

		&__container {
			position: absolute;
			top: 32px;
			right: 0;
			z-index: 1000;
			display: flex;
			width: max-content;
			align-items: flex-start;
			gap: 10px;
			flex-direction: column;
			background: #fff;
			border: 1px solid #d8dbdf;
			border-radius: 10px;
			padding: 10px;
		}
		&__row {
			display: flex;
			align-items: center;
			justify-content: flex-start;
			gap: 10px;
		}
	}

	.rearrange-column__container {
		display: flex;
		flex-direction: column;
		row-gap: 5px;

		div {
			transition: all 0.3s ease; /* Smooth transition for all properties */

			/* Hover styles */
			&:hover {
				outline: 2px solid #7ddaff;
				border-radius: 5px;
				box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
				background-color: #beecff;
				transform: scale(1.03);
			}
		}

		div.dragging {
			outline: 2px solid #7ddaff;
			border-radius: 5px;
			box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
			background-color: #beecff;
			transform: scale(1.03);
		}
	}
</style>

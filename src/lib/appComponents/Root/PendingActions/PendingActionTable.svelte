<script>
	import isEmpty from '@utils/is-empty';

	export let actions = [];
	export let columns = [];
	export let getAffectedEntitiesMessage;
	export let handleAction;
	export let operation;
	export let disableApprove = (arg) => { return false };
	export let isLeadUser;

</script>

<table>
	<thead>
		<tr>
			{#each columns as column}
				<th
					class={column.isActionColumn ? 'action' : ''}
					style="width: {column.width};">{column.label}</th
				>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each actions as action (action.id)}
			<tr
				class={!isEmpty(action.affected_entities)
					? 'row-with-info'
					: 'row'}
			>
				{#each columns as column}
					{#if column.isActionColumn}
						<td>
							{#if isLeadUser}
								<button
									class="approve-btn {disableApprove(action.affected_entities)
										? 'disabled-btn'
										: ''}"
									disabled={disableApprove(action.affected_entities)}
									on:click={() =>
										handleAction(action, 'approve', operation)}
									>Approve</button
								>
							{/if}
							<button
								class="reject-btn"
								on:click={() => handleAction(action, 'reject', operation)}
								>Reject</button
							>
						</td>
					{:else}
						<td>{action[column.value] || column.fallback || ''}</td>
					{/if}
				{/each}
			</tr>

			{#if !isEmpty(action.affected_entities)}
				<tr class="info-row">
					<td colspan={columns.length}>
						{@html getAffectedEntitiesMessage(
							action.affected_entities,
							operation
						)}
					</td>
				</tr>
			{/if}
		{/each}
	</tbody>
</table>

<style src="./style.scss"></style>

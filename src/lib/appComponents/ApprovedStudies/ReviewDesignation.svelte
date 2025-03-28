<script>
	import {
		REGULATORY_DESIGNATIONS,
		REGULATORY_DESIGNATION_STATUSES,
	} from '@models/studies';
	import isEmpty from '@utils/is-empty';
	import Select from 'svelte-select';

	export let value = [];

	let editingIndex = null;
	let isNewRow = false;
	let originalRow = null;

	let tempDesignation = null;
	let tempStatus = null;

	const allDesignationOptions = REGULATORY_DESIGNATIONS.map((item) => ({
		label: item,
		value: item,
	}));

	const allStatusOptions = REGULATORY_DESIGNATION_STATUSES.map((item) => ({
		label: item,
		value: item,
	}));

	$: usedDesignations =
		(value &&
			(editingIndex !== null && !isNewRow
				? value
						.filter((_, i) => i !== editingIndex)
						.map((row) => row.designation)
				: value.map((row) => row.designation))) ||
		[];

	$: filteredDesignationOptions = allDesignationOptions.filter((option) => {
		return !usedDesignations.includes(option.value);
	});

	const addNew = () => {
		cancelEdit();

		editingIndex = value?.length || 0;
		isNewRow = true;
	};

	const editRow = (index) => {
		cancelEdit();

		editingIndex = index;
		originalRow = { ...value[index] };
		if (value[index].designation) {
			tempDesignation = {
				value: value[index].designation,
				label: value[index].designation,
			};
		}
		if (value[index].status) {
			tempStatus = {
				value: value[index].status,
				label: value[index].status,
			};
		}
	};

	const deleteRow = (index) => {
		cancelEdit();
		value = value.filter((_, i) => i !== index);
	};

	const saveRow = (index) => {
		if (isEmpty(tempDesignation?.value)) {
			return;
		}
		const updatedRow = {
			designation: tempDesignation?.value,
			status: tempStatus?.value || '',
		};
		if (isNewRow) {
			value = value ? [...value, updatedRow] : [updatedRow];
		} else {
			value[index] = updatedRow;
		}
		resetEditing();
	};

	const cancelEdit = () => {
		if (!isNewRow && editingIndex !== null && originalRow) {
			value[editingIndex] = originalRow;
		}
		resetEditing();
	};

	const resetEditing = () => {
		editingIndex = null;
		isNewRow = false;
		originalRow = null;
		tempDesignation = null;
		tempStatus = null;
	};
</script>

<div class="review-designation">
	<div class="review-designation__label">Regulatory Designation</div>
	<div class="review-designation__content">
		<table>
			<thead>
				<tr>
					<th class="th-designation">Designation</th>
					<th class="th-status">Status</th>
					<th class="th-action">Action</th>
				</tr>
			</thead>
			<tbody>
				{#if value}
					{#each value as row, i}
						{#if editingIndex === i && !isNewRow}
							<tr class="tr-edit">
								<td>
									<Select
										items={filteredDesignationOptions}
										bind:value={tempDesignation}
										placeholder="Select designation"
									/>
								</td>
								<td>
									<Select
										items={allStatusOptions}
										bind:value={tempStatus}
										placeholder="Select status"
									/>
								</td>
								<td class="td-actions">
									<button
										type="button"
										class="btn"
										on:click={() => saveRow(i)}
										class:btn--disabled={!tempDesignation}
										disabled={!tempDesignation}>Save</button
									>
									<button
										type="button"
										class="btn"
										on:click={cancelEdit}>Cancel</button
									>
								</td>
							</tr>
						{:else}
							<tr>
								<td>{row.designation}</td>
								<td>{row.status}</td>
								<td class="td-actions">
									<button
										type="button"
										class="btn"
										on:click={() => editRow(i)}>Edit</button
									>
									<button
										type="button"
										class="btn"
										on:click={() => deleteRow(i)}
										>Delete</button
									>
								</td>
							</tr>
						{/if}
					{/each}
				{/if}

				{#if isNewRow}
					<tr>
						<td>
							<Select
								items={filteredDesignationOptions}
								bind:value={tempDesignation}
								placeholder="Select designation"
							/>
						</td>
						<td>
							<Select
								items={allStatusOptions}
								bind:value={tempStatus}
								placeholder="Select status"
							/>
						</td>
						<td class="td-actions">
							<button
								type="button"
								class="btn"
								on:click={() => saveRow(editingIndex)}
								class:btn--disabled={!tempDesignation}
								disabled={!tempDesignation}>Save</button
							>
							<button
								type="button"
								class="btn"
								on:click={cancelEdit}>Cancel</button
							>
						</td>
					</tr>
				{/if}
				<tr>
					<td colspan="3">
						<button type="button" class="btn" on:click={addNew}
							>Add New</button
						>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>

<style lang="scss">
	.review-designation {
		width: 56%;
		&__label {
			font-size: 12px;
			color: #8b8b8b;
		}

		&__content {
			table {
				table-layout: fixed;
				width: 100%;
				border-collapse: collapse;
				background-color: white;

				thead {
					tr {
						background-color: #f8f9fa;

						th {
							font-size: 12px;
							font-weight: 400;
							border: 1px solid #e2e2e2;
							padding: 0.5rem;
							color: #333333;
						}

						.th-designation {
							width: 50%;
						}
						.th-status {
							width: 30%;
						}
						.th-action {
							width: 20%;
						}
					}
				}

				tbody {
					td {
						border: 1px solid #e2e2e2;
						padding: 0.5rem;
					}

					.td-actions {
						text-align: center;
					}

					.tr-edit {
						background: #f3f4f6;
					}
				}
			}
			.btn {
				margin: 0 0.25rem;
				border: none;
				background: none;
				cursor: pointer;
				color: var(--primary-color);

				&--disabled {
					cursor: not-allowed;
					opacity: 0.7;
				}
			}

			:global(.svelte-select) {
				--font-size: 14px;
				--height: 30px;
				--max-height: 30px;
			}
		}
	}
</style>

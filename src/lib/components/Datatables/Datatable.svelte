<script>
	// @ts-nocheck
	import DataTable, {
		Head,
		Body,
		Row,
		Cell,
		Pagination,
	} from '@smui/data-table';
	import Select, { Option } from '@smui/select';
	import Selectbox from '@components/Selectbox/Selectbox.svelte';
	import IconButton, { Icon } from '@smui/icon-button';
	import { Label } from '@smui/common';
	import CircularLoader from '@components/CircularLoader/index.svelte';
	import Input from '@components/Input/Input.svelte';
	import { debounce } from '@utils/utility';
	import isEmpty from '@utils/is-empty.js';
	import { onMount , onDestroy} from 'svelte';
	import { flip } from "svelte/animate";
	import { dndzone } from "svelte-dnd-action";
	import createDatatableStore from '@stores/datatableConfigStore.js'; // Import the new datatable store

	export let columns = [];
	export let data = [];
	export let rowsPerPage = 10;
	export let currentPage = 1;
	export let hasNext = true;
	export let loading = false;
	export let disableGlobalSearch = false;
	export let handleSort = () => {};
	export let handlefilter = () => {};
	export let onGlobalSearch = (searchTerm) => {};
	export let onPageChange = () => {};
	export let searchTerm = '';
	export let columnSearchQuery = [];
	export let sort = null;
	export let sortDirection = 'none';
	export let toggleColumns = false;
	export let disablePagination = false;
	export let configStorageKey = '';
	export let keyedEachIndex = 'id';

	let columnSearch = [];
	let datatableElement;
	let showColumn = false;
	let draggingItem = null;
	let isFontSizeSmall = false;
	const flipDurationMs = 300;
	const configStore = createDatatableStore(configStorageKey, {}); // Create the persistent store for the table

	$: start = (currentPage - 1) * rowsPerPage + 1;
	$: end = currentPage * rowsPerPage;
	$: sortable = !!columns.find((column) => column.sortable);
	$: searchable = !!columns.find((column) => column.searchable);

	const resetConfigIfColumnsChanged = () => {
		const savedColumnNames = $configStore.column_order || [];
		const currentColumnNames = columns.map((col) => col.value);

		// Check if current columns differ from saved columns
		const hasColumnChanges =
			savedColumnNames.length !== currentColumnNames.length ||
			!currentColumnNames.every((name) =>
				savedColumnNames.includes(name)
			) ||
			!savedColumnNames.every((name) =>
				currentColumnNames.includes(name)
			);

		if (hasColumnChanges) {
			configStore.remove();
		}
	};

	// Function to initialize or update the config store
	const initializeOrUpdateConfigStore = (columnDefinitions) => {
		const column_order = columns.map((col) => col.value);
		const hidden_columns = [];

		// Update configStore with new column_order and hidden_columns
		configStore.updateTable({ column_order, hidden_columns });

		// Set all columns to be shown initially
		columns = columns.map((column) => ({
			...column,
			show: true,
		}));
	};

	// Function to update the column visibility based on the stored config
	const updateColumnsFromConfig = (columnDefinitions) => {
		columns = $configStore.column_order.map((columnTableName) => {
			const originalColumn = columnDefinitions.find(
				(col) => col.value === columnTableName
			);

			return {
				...originalColumn,
				show: !$configStore.hidden_columns.includes(columnTableName),
			};
		});
	};

	onMount(() => {
		let id = 1;
		for (let key in columns) {
			if (columns.hasOwnProperty(key)) {
				columns[key].id = id++;
			}
		}

		let columnDefinitions = [...columns];

		if (configStorageKey) {
			resetConfigIfColumnsChanged();
			if ($configStore && !isEmpty($configStore)) {
				updateColumnsFromConfig(columnDefinitions); // Load stored config
			} else {
				initializeOrUpdateConfigStore(columnDefinitions); // Initialize new config
			}
		}

		if (!isEmpty(columnSearchQuery)) {
			columnSearchQuery.forEach((query) => {
				const index = columns.findIndex(
					(column) => column.tableName === query.key
				);
				columnSearch[index] = query.value;
			});
		}
		window.addEventListener('wheel', preventHorizontalScroll, { passive: false });
	});

	onDestroy(()=>{
		window.removeEventListener('wheel', preventHorizontalScroll);
	})

	function preventHorizontalScroll(e) {
		const scrollElement = datatableElement.getElement()?.firstChild;
		const preventLeft = event.deltaX < 0 && scrollElement.scrollLeft === 0;
		const preventRight = event.deltaX > 0 && (scrollElement.scrollLeft + scrollElement.clientWidth === scrollElement.scrollWidth);
		if (preventLeft || preventRight) {
			e.preventDefault();
		}
  	}

	const getSelectFilter = (index) => {
		let value;
		if (!isEmpty(columnSearch[index])) {
			value = columns[index].searchOptions?.find(
				(option) => option.value === columnSearch[index]
			);
		}
		return value;
	};

	const debouncedSearch = debounce(async (e) => {
		currentPage = 1;
		await onGlobalSearch(e.target.value);
	}, 400);
	const debouncedColumnSearch = debounce(async (e) => {
		currentPage = 1;
		columnSearchQuery = [];
		columnSearch.forEach((value, index) => {
			const column = columns[index];
			if (!isEmpty(value) && column) {
				columnSearchQuery.push({
					key: column.tableName,
					operator:
						column.searchType === 'SELECT' || value === '-'
							? '=='
							: '=%',
					value: value === '-' ? 'None' : value,
				});
			}
		});
		await handlefilter(columnSearchQuery);
	}, 400);
	const onColumnSearch = (value, index) => {
		columnSearch[index] = value;
		debouncedColumnSearch();
	};
	const renderValue = (value, column) => {
		if (isEmpty(value)) {
			return '-';
		}
		if (typeof value == 'object') {
			return JSON.stringify(value);
		}
		if (column.searchType === 'SELECT') {
			return (
				column.searchOptions.find((column) => column.value === value)
					?.label || value
			);
		}
		return value;
	};
	const getStyle = (width) => {
		if (width) {
			return `width: ${width}px; min-width: ${width}px; max-width: ${width}px;`;
		}
		return `width: fit-content; min-width: 130px; max-width: 332px;`;
	};
	const scrollToTheTop = () => {
		const element = datatableElement.getElement()?.firstChild;
		if (element) {
			element.scrollTop = 0;
		}
	};
	function toggleFontSize() {
		isFontSizeSmall = !isFontSizeSmall;
	}
	const handleDndConsider = (e) => {
		columns = e.detail.items;
		saveConfig();
	}
	const handleDndFinalize = (e) => {
		columns = e.detail.items;
		handleDragEnd();
		saveConfig();
	}
	function handleDragStart(item) {
		draggingItem = item.id;
	}
	const handleDragEnd = () => {
		draggingItem = null;
	}
	const handleCheckboxChange = () => {
		saveConfig();
	}
	const saveConfig = () => {
		if (configStorageKey) {
			const column_order = columns.map((col) => col.value);
			const hidden_columns = columns
				.filter((col) => !col.show)
				.map((col) => col.value);
			configStore.updateTable({ column_order, hidden_columns });
		}
	}
</script>

<svelte:window
	on:click={() => {
		if (showColumn) {
			showColumn = false;
		}
	}}
/>
<div class="datatable">
	<div class="datatable__header">
		<div class="global-search">
			{#if !disableGlobalSearch}
				<Input
					placeholder="Search"
					bind:value={searchTerm}
					onInput={debouncedSearch}
				/>
			{/if}
		</div>
		<div class="datatable__header__buttons">
			<slot name="header-button" />
			{#if toggleColumns}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div class="toggle-column" on:click|stopPropagation>
					<IconButton
						class="material-icons"
						title="Font Size"
						ripple={false}
						on:click={toggleFontSize}
					>
						text_fields
					</IconButton>
					<IconButton
						class="material-icons"
						title="Columns to show"
						ripple={false}
						on:click={() => {
							showColumn = !showColumn;
						}}
					>
						filter_alt
					</IconButton>
					{#if showColumn}
						<div class="toggle-column__container">
							<section
								class="rearrange-column__container"
								use:dndzone={{items: columns, flipDurationMs}}
								on:consider={handleDndConsider}
								on:finalize={handleDndFinalize}
							>
								{#each columns as item(item.id)}
									<div
										class:dragging={draggingItem === item.id}
										animate:flip={{ duration: flipDurationMs }}
										on:mousedown={() => handleDragStart(item)}
										on:mouseup={() => handleDragEnd()}
									>
										<input
											bind:checked={item.show}
											type="checkbox"
											on:change={() => handleCheckboxChange(item)}
										/>
										{item.label}
									</div>
								{/each}
							</section>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
	<div class="datatable__content">
		<DataTable
			style="width: 100%; min-width: 450px;"
			{sortable}
			bind:sort
			bind:sortDirection
			bind:this={datatableElement}
			on:SMUIDataTable:sorted={handleSort}
			class={`
			    ${sortDirection === 'descending' ? 'mdc-data-table__header-cell--sorted-descending' : ''}
			    ${isFontSizeSmall ? ' small-font' : ''}
			`}
		>
			<Head>
				<Row>
					{#each columns as column (column.value)}
						{#if column.show || !toggleColumns}
							<Cell
								numeric
								sortable={column.sortable ?? false}
								columnId={column.tableName}
								class={column.value === 'ACTION' || column?.file && column.file === true
									? 'datatable--center'
									: ''}
								style={getStyle(column.width)}
							>
								{column.label}
								{#if column.sortable}
									<IconButton class="material-icons">
										arrow_upward
									</IconButton>
								{/if}
							</Cell>
						{/if}
					{/each}
				</Row>
				{#if searchable}
					<Row>
						{#each columns as column, index}
							{#if column.show || !toggleColumns}
								<Cell
									on:click={(event) =>
										event.stopPropagation()}
									style={getStyle(column.width)}
								>
									{#if column.searchable}
										{#if column.searchType === 'SELECT'}
											{#key columnSearch}
												<Selectbox
													placeholder="Select"
													items={column.searchOptions}
													onSelect={(event) =>
														onColumnSearch(
															event?.detail
																?.value,
															index
														)}
													onClear={() =>
														onColumnSearch(
															'',
															index
														)}
													clearable={column.clearable ??
														true}
													clearFilterTextOnBlur={true}
													value={getSelectFilter(
														index,
														column
													)}
													width='100%'
												/>
											{/key}
										{:else}
											<div
												class="datatable__header-search-input"
											>
												<Input
													placeholder="Search"
													bind:value={columnSearch[
														index
													]}
													onInput={debouncedColumnSearch}
												/>
											</div>
										{/if}
									{/if}
								</Cell>
							{/if}
						{/each}
					</Row>
				{/if}
			</Head>

			<Body>
				{#each data as item (item[keyedEachIndex])}
					<Row>
						{#each columns as column}
							{#if column.show || !toggleColumns}
								{#if column.value === 'ACTION' || (column?.file && column.file === true)}
									<Cell
										class="datatable--center"
										style={getStyle(column.width)}
									>
										{#each column.actions as action}
											{#if !action.key || (action.key && item[action.key])}
												{@const disabled =
													action.disableIf &&
													action.disableIf(item)}
												<div
													class="action-btn {disabled
														? 'action-btn--disabled'
														: ''}"
												>
													<Icon
														class="material-icons mdc-icon-button mdc-icon-button--display-flex mdc-ripple-upgraded--unbounded {disabled
															? 'mdc-icon-button--disabled'
															: ''}"
														ripple={false}
														title={action.title ||
															action.iconName}
														on:click={() =>
															action.handler(
																item
															)}
													>
														<div
															class="mdc-icon-button__ripple"
														/>
														{action.iconName}
													</Icon>
													{#if item[action.key]}
														{item[action.key]}
													{/if}
												</div>
											{:else}
												{'NA'}
											{/if}
										{/each}
									</Cell>
								{:else}
									{@const data = renderValue(
										item[column.value],
										column
									)}
									<Cell
										title={data}
										style={getStyle(column.width)}
									>
										{#if column.cellComponent}
											{@const props = column.cellComponentProps 
											     ? column.cellComponentProps(item) 
											     : { data: item[column.value], column }
											}
												<svelte:component this={column.cellComponent} {...props} />
										{:else if column.transformContent}
											{column.transformContent(item)}
										{:else}
											{data}
										{/if}
									</Cell>
								{/if}
							{/if}
						{/each}
					</Row>
				{:else}
					<Row>
						<Cell colspan={columns.length}>
							{loading ? '' : 'No data found'}
						</Cell>
					</Row>
				{/each}
				{#if loading}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div class="loader" on:click|preventDefault|stopPropagation>
						<CircularLoader />
					</div>
				{/if}
			</Body>
			<Pagination
				slot="paginate"
				class={(start - 1 + data.length <= 10 && hasNext == false) || disablePagination
					? 'datatable__pagination--hidden'
					: ''}
			>
				<svelte:fragment slot="rowsPerPage">
					<Label>Rows Per Page</Label>
					<Select
						variant="outlined"
						bind:value={rowsPerPage}
						noLabel
						on:SMUISelect:change={() => {
							currentPage = 1;
							onPageChange(currentPage, rowsPerPage);
							scrollToTheTop();
						}}
					>
						<Option value={10}>10</Option>
						<Option value={25}>25</Option>
						<Option value={100}>100</Option>
					</Select>
				</svelte:fragment>
				<svelte:fragment slot="total">
					{start}-{end}
				</svelte:fragment>
				<IconButton
					class="material-icons pagination-icon"
					action="first-page"
					title="First page"
					ripple={false}
					on:click={() => {
						currentPage = 1;
						onPageChange(currentPage, rowsPerPage);
						scrollToTheTop();
					}}
					disabled={currentPage === 1}>first_page</IconButton
				>
				<IconButton
					class="material-icons pagination-icon"
					action="prev-page"
					title="Prev page"
					ripple={false}
					on:click={() => {
						onPageChange(--currentPage, rowsPerPage);
						scrollToTheTop();
					}}
					disabled={currentPage === 1}
				>
					chevron_left
				</IconButton>
				<IconButton
					class="material-icons pagination-icon"
					action="next-page"
					title="Next page"
					ripple={false}
					on:click={() => {
						onPageChange(++currentPage, rowsPerPage);
						scrollToTheTop();
					}}
					disabled={hasNext === false}
				>
					chevron_right
				</IconButton>
			</Pagination>
		</DataTable>
	</div>
</div>

<style src="./style.scss"></style>

const filterOperators = {
	equals: '==',
	notEqual: '!=',
	contains: '%%',
	startsWith: '=%',
	endsWith: '%=',
	lessThan: '<',
	lessThanOrEqual: '<=',
	greaterThan: '>',
	greaterThanOrEqual: '>=',
};

export const TextFilters = [
	'equals',
	'notEqual',
	'contains',
	'startsWith',
	'endsWith',
];
export const NumberFilters = [
	'equals',
	'notEqual',
	'lessThan',
	'lessThanOrEqual',
	'greaterThan',
	'greaterThanOrEqual',
];

export function processDatatableFilters(
	columnFilters,
	table,
	excludeFilterQuery
) {
	return columnFilters.map((columnFilter) => {
		const column = table.getAllColumns().find((column) => {
			return (
				column.id === columnFilter.id &&
				!excludeFilterQuery.includes(column.id)
			);
		});
		if (!column?.getCanFilter()) return null;
		const columnDef = column.columnDef;

		let type = columnDef.filterFn || 'startsWith';
		if (
			columnDef.meta?.filterVariant === 'select' ||
			columnFilter.value === '-'
		) {
			type = 'equals';
		}

		const key = columnFilter.id;
		let value = columnFilter.value;

		if (value === '-') {
			value = 'None';
		}
		return {
			key,
			operator: filterOperators[type],
			value,
		};
	});
}

export const getCommonPinningStyles = (column) => {
	const isPinned = column.getIsPinned();
	const isLastLeftPinnedColumn =
		isPinned === 'left' && column.getIsLastColumn('left');
	const isFirstRightPinnedColumn =
		isPinned === 'right' && column.getIsFirstColumn('right');

	return `
    box-shadow: ${
		isLastLeftPinnedColumn
			? '-4px 0 4px -4px gray inset'
			: isFirstRightPinnedColumn
				? '4px 0 4px -4px gray inset'
				: 'unset'
	};
    left: ${isPinned === 'left' ? column.getStart('left') + 'px' : 'unset'};
    right: ${isPinned === 'right' ? column.getAfter('right') + 'px' : 'unset'};
    position: ${isPinned ? 'sticky' : 'relative'};
    ${isPinned ? 'z-index: 100' : ''};`;
};

export let customFilterFns = {
	equals: (row, columnId, filterValue) =>
		row.getValue(columnId).toString().toLowerCase().trim() ===
		String(filterValue).toLowerCase().trim(),
	notEqual: (row, columnId, filterValue) =>
		row.getValue(columnId).toString().toLowerCase().trim() !==
		String(filterValue).toLowerCase().trim(),
	contains: (row, columnId, filterValue) =>
		row
			.getValue(columnId)
			.toString()
			.toLowerCase()
			.trim()
			.includes(String(filterValue).toLowerCase().trim()),
	startsWith: (row, columnId, filterValue) =>
		row
			.getValue(columnId)
			.toString()
			.toLowerCase()
			.trim()
			.startsWith(String(filterValue).toLowerCase().trim()),
	endsWith: (row, columnId, filterValue) =>
		row
			.getValue(columnId)
			.toString()
			.toLowerCase()
			.trim()
			.endsWith(String(filterValue).toLowerCase().trim()),
	lessThan: (row, columnId, filterValue) =>
		Number(row[columnId]) < Number(filterValue),
	lessThanOrEqual: (row, columnId, filterValue) =>
		Number(row[columnId]) <= Number(filterValue),
	greaterThan: (row, columnId, filterValue) =>
		Number(row[columnId]) > Number(filterValue),
	greaterThanOrEqual: (row, columnId, filterValue) =>
		Number(row[columnId]) >= Number(filterValue),
};

import { functionalUpdate, makeStateUpdater } from '@tanstack/svelte-table';

export const DensityFeature = {
	// define the new feature's initial state
	getInitialState: (state) => {
		return {
			density: 'md',
			...state,
		};
	},

	// define the new feature's default options
	getDefaultOptions(table) {
		return {
			enableDensity: true,
			// @ts-ignore
			onDensityChange: makeStateUpdater('density', table),
		};
	},
	// if you need to add a default column definition...
	// getDefaultColumnDef: <TData extends RowData>(): Partial<ColumnDef<TData>> => {
	//   return { meta: {} } //use meta instead of directly adding to the columnDef to avoid typescript stuff that's hard to workaround
	// },

	// define the new feature's table instance methods
	createTable(table) {
		table.setDensity = (updater) => {
			const safeUpdater = (old) => {
				let newState = functionalUpdate(updater, old);
				return newState;
			};
			return table.options.onDensityChange?.(safeUpdater);
		};
		table.toggleDensity = (value) => {
			table.setDensity((old) => {
				if (value) return value;
				return old === 'lg' ? 'md' : old === 'md' ? 'sm' : 'lg'; //cycle through the 3 options
			});
		};
		table.getDensity = () => {
			return table.getState().density;
		};
	},

	createHeader(header) {
		header.getDensity = () => {
			return header.getContext().table.getState().density;
		};
	},

	// if you need to add row instance APIs...
	// createRow: <TData extends RowData>(row, table): void => {},
	// if you need to add cell instance APIs...
	// createCell: <TData extends RowData>(cell, column, row, table): void => {},
	// if you need to add column instance APIs...
	// createColumn: <TData extends RowData>(column, table): void => {},
	// if you need to add header instance APIs...
	// createHeader: <TData extends RowData>(header, table): void => {},
};

export const ViewFullFeature = {
	getInitialState: (state) => {
		return {
			fullView: new Set(),
			...state,
		};
	},

	getDefaultOptions(table) {
		return {
			enableFullView: true,
			// @ts-ignore
			onFullViewChange: makeStateUpdater('fullView', table),
		};
	},

	createTable(table) {
		table.setFullView = (updater) =>
			table.options.onFullViewChange == null
				? void 0
				: table.options.onFullViewChange(updater);

		table.toggleRowFullView = (rowId) => {
			table.setFullView((old) => {
				const newSet = new Set(old);
				if (newSet.has(rowId)) {
					newSet.delete(rowId);
				} else {
					newSet.add(rowId);
				}
				return newSet;
			});
		};

		table.getIsRowFullView = (rowId) => {
			return table.getState().fullView.has(rowId);
		};

		table.toggleAllRowsFullView = () => {
			table.setFullView((old) => {
				const allRowIds = table.getRowModel().rows.map((row) => row.id);
				const newSet = new Set(old);
				const areAllRowsExpanded = allRowIds.every((id) =>
					newSet.has(id)
				);

				if (areAllRowsExpanded) {
					return new Set();
				} else {
					return new Set(allRowIds);
				}
			});
		};
	},

	createRow(row, table) {
		row.toggleFullView = () => {
			table.toggleRowFullView(row.id);
		};

		row.getIsFullView = () => {
			return table.getIsRowFullView(row.id);
		};
	},
};

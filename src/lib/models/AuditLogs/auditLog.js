import { get } from '@utils/api';
import { READOUTS_SECTION_TYPE } from '@models/readoutsSections.js';
import { toasts } from '@components/Toast/toasts.js';

export const PARENT_ENTITIES = {
	ROOT: 'ROOT',
	STUDY: 'STUDY',
	READOUT: 'READOUT',
};

export const AUDITLOG_ACTIONS = {
	INSERT: 'Insert',
	DELETE: 'Delete',
	UPDATE: 'Update',
	MERGE: 'Merge',
	INVALID: 'Invalid',
	BULK_PROCESS: 'Bulk Process',
};

export async function fetchAuditLogHistory(queryParams) {
	const { responseData } = await get(
		`/audit_log_history?${new URLSearchParams(queryParams).toString()}`
	);
	return responseData?.data || [];
}

export const insertLog = (generator, log, formattedDate) => {
	return {
		type: 'insert',
		table_name: log.table_name,
		date: formattedDate,
		action: 'New',
		triggeredBy: log.triggered_by,
		data: generator.generateTitleData(log.table_name, log.new_value),
	};
};

export const mergeLog = (log, formattedDate) => {
	return {
		type: 'merge',
		table_name: log.table_name,
		date: formattedDate,
		action: log.action,
		oldName: log.old_value.name,
		newName: log.new_value.name,
		triggeredBy: log.triggered_by,
	};
};

export const deleteLog = (generator, log, formattedDate) => {
	return {
		type: 'delete',
		table_name: log.table_name,
		date: formattedDate,
		action: log.action,
		triggeredBy: log.triggered_by,
		data: generator.generateTitleData(log.table_name, log.old_value),
	};
};

const formatValue = (value) =>
	typeof value === 'object' && value !== null
		? JSON.stringify(value, null, 2)
		: value;

const trackChanges = (key, oldValue, newValue) => {
	let hasChanges = true;
	let changeEntry = null;

	if (oldValue !== undefined && newValue === undefined) {
		changeEntry = {
			attribute: key,
			oldValue: formatValue(oldValue),
			newValue: 'null',
		};
	} else if (newValue !== undefined && oldValue === undefined) {
		changeEntry = {
			attribute: key,
			oldValue: 'null',
			newValue: formatValue(newValue),
		};
	} else if (formatValue(newValue) !== formatValue(oldValue)) {
		changeEntry = {
			attribute: key,
			oldValue: formatValue(oldValue),
			newValue: formatValue(newValue),
		};
	} else {
		hasChanges = false;
	}

	return { hasChanges, changeEntry };
};

export const processChanges = (
	section_type,
	oldValue,
	newValue,
	keyPrefix = ''
) => {
	const subKeys = new Set([
		...Object.keys(newValue || {}),
		...Object.keys(oldValue || {}),
	]);

	const changes = [];
	const deletions = [];

	for (let subKey of subKeys) {
		const newSubValue = newValue?.[subKey];
		const oldSubValue = oldValue?.[subKey];

		if (section_type === READOUTS_SECTION_TYPE.STUDY_DESIGN) {
			subKey = `${keyPrefix}:_${subKey}`;
		}

		const { hasChanges, changeEntry } = trackChanges(
			subKey,
			oldSubValue,
			newSubValue
		);
		if (hasChanges) {
			changes.push(changeEntry);
		} else {
			deletions.push(subKey);
		}
	}

	return { changes, deletions };
};

export const loadAuditLog = async (
	entity,
	entityId,
	tableName,
	columnFilter
) => {
	try {
		let params = {
			entity,
			entity_id: entityId,
			table_name: tableName,
		};
		if (columnFilter !== '') {
			params['column_filter'] = columnFilter;
		}
		return await fetchAuditLogHistory({ ...params });
	} catch (error) {
		toasts.error(
			error.message ||
				'An unexpected error occurred while loading auditlogs'
		);
	}
};

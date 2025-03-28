import { TABLE_NAME } from '@utils/constants.js';
import { ROOT_LABELS } from '@models/roots.js';
import isEmpty from '@utils/is-empty.js';
import { PENDING_ACTIONS } from '@models/pendingActions.js';
import { READOUTS_SECTION_TYPE } from '@models/readoutsSections.js';

class TitleDataGenerator {
	constructor(entityId) {
		this.entityId = entityId;
	}

	generateTitleData(table, logValues) {
		switch (table) {
			case TABLE_NAME.ROOTS:
				return this.handleRoots(logValues);
			case TABLE_NAME.SYNONYMS:
				return this.handleSynonyms(logValues);
			case TABLE_NAME.RELATIONSHIPS:
				return this.handleRelationships(logValues);
			case TABLE_NAME.TRIALS:
				return this.handleTrials(logValues);
			case TABLE_NAME.DRUGS_STUDIES:
				return this.handleDrugsStudies(logValues);
			case TABLE_NAME.DISEASES_STUDIES:
				return this.handleDiseasesStudies(logValues);
			case TABLE_NAME.ORGANIZATIONS_STUDIES:
				return this.handleOrganizationsStudies(logValues);
			case TABLE_NAME.ORGANIZATIONS:
				return this.handleOrganizations(logValues);
			case TABLE_NAME.READOUTS:
				return this.handleReadouts(logValues);
			case TABLE_NAME.READOUTS_SECTIONS:
				return this.handleReadoutsSections(logValues);
			case TABLE_NAME.READOUTS_KEYWORDS:
				return this.handleReadoutsKeywords(logValues);
			case TABLE_NAME.READOUTS_STUDIES:
				return this.handleReadoutsStudies(logValues);
			case TABLE_NAME.PENDING_ACTIONS:
				return this.handlePendingActions(logValues);
			default:
				return {};
		}
	}

	handleRoots(logValues) {
		return { [logValues.label]: logValues.name };
	}

	handleSynonyms(logValues) {
		return { Synonym: logValues.name };
	}

	handleRelationships(logValues) {
		let key =
			+this.entityId === +logValues.parent_root_id
				? 'Child Relationship'
				: 'Parent Relationship';
		let value =
			+this.entityId === +logValues.parent_root_id
				? logValues.child_root_name
				: logValues.parent_root_name;
		return { [key]: value };
	}

	handleTrials(logValues) {
		return { 'NCT ID': logValues.nct_id };
	}

	handleDrugsStudies(logValues) {
		if (logValues.drug_root_id) {
			return { ['DRUG']: logValues.drug_root_name };
		}
		return {};
	}

	handleDiseasesStudies(logValues) {
		if (logValues.disease_root_id && isEmpty(logValues.indication)) {
			return { [ROOT_LABELS.DISEASE]: logValues.disease_root_name };
		} else if (!logValues.disease_root_id && logValues.indication) {
			return { Indication: logValues.indication };
		} else if (logValues.disease_root_id && logValues.indication) {
			return {
				[ROOT_LABELS.DISEASE]: logValues.disease_root_name,
				Indication: logValues.indication,
			};
		}
		return {};
	}

	handleOrganizationsStudies(logValues) {
		return {
			[ROOT_LABELS.ORGANIZATION]: logValues.organization_root_name,
			Role: logValues.organization_role,
		};
	}

	handleOrganizations(logValues) {
		return {
			[ROOT_LABELS.ORGANIZATION]: logValues.organization_root_name,
		};
	}

	handleReadouts(logValues) {
		return { Readout: logValues.title };
	}

	handleReadoutsKeywords(logValues) {
		return { [logValues.label]: logValues.value };
	}

	handleReadoutsStudies(logValues) {
		return { 'NCT ID': logValues.study_trial_nct_id };
	}

	handlePendingActions(logValues) {
		if (logValues.action === PENDING_ACTIONS.INVALID) {
			return { 'Pending action for': 'Invalidate' };
		} else if (logValues.action === PENDING_ACTIONS.MERGE) {
			return { 'Pending action for Merge': logValues.root_name };
		} else if (logValues.action === PENDING_ACTIONS.LABEL_CHANGE) {
			return { 'Pending action for Label Change': logValues.value_1 };
		}
		return {};
	}

	handleReadoutsSections(logValues) {
		const { section_type, section_content, section_summary } = logValues;
		const isBasicSection = [READOUTS_SECTION_TYPE.BACKGROUND, READOUTS_SECTION_TYPE.CONCLUSION].includes(section_type);

		return {
			'Section Type': section_type ?? null,
			'Section Content': isBasicSection ? (section_content?.content ?? null) : (section_content ?? null),
			'Section Summary': isBasicSection ? (section_summary?.summary ?? null) : (section_summary ?? null)
		};
	}
}

export default TitleDataGenerator;
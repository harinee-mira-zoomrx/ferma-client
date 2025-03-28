import { get, patch } from '../utils/api';

export async function fetchReadouts(queryParams) {
	const { responseData } = await get(
		`/readouts?${new URLSearchParams(queryParams).toString()}`
	);
	return [responseData?.data || [], responseData.has_next];
}

export async function fetchReadout(id, queryParams) {
	const { responseData } = await get(
		`/readouts/${id}?${new URLSearchParams(queryParams).toString()}`
	);
	return responseData || {};
}

export async function updateReadout(id, body) {
	const { responseData } = await patch('/readouts/' + id, body);
	return responseData?.data || {};
}

export const READOUT_SOURCE_TYPE = {
	CONFERENCE: 'CONFERENCE',
	EARNINGS_CALL_TRANSCRIPT: 'EARNINGS_CALL_TRANSCRIPT',
	EARNINGS_CALL_PRESENTATION: 'EARNINGS_CALL_PRESENTATION',
	SEC_FILING: 'SEC_FILING',
	CORPORATE_PRESENTATIONS: 'CORPORATE_PRESENTATIONS',
	JOURNAL: 'JOURNAL',
	NEWS: 'NEWS',
	PRESS_RELEASE: 'PRESS_RELEASE',
	OTHER: 'OTHER',
	INVESTOR_REPORT: 'INVESTOR_REPORT',
	CT_WEBSITE: 'CT_WEBSITE',
};

export const READOUT_SOURCE_NAME = {
	ASCO: 'ASCO',
	ESMO: 'ESMO',
	AACR: 'AACR',
	ASH: 'ASH',
	EHA: 'EHA',
	LANCET: 'LANCET',
	SCIENCE_DIRECT: 'SCIENCE_DIRECT',
	ESMO_OPEN: 'ESMO_OPEN',
	NATURE: 'NATURE',
	JACC: 'JACC',
	ASCO_PUBS: 'ASCO_PUBS',
	BMJ: 'BMJ',
	AACR_JOURNAL: 'AACR_JOURNAL',
	FRONTIERS: 'FRONTIERS',
	JAMA: 'JAMA',
	NEUROLOGY_JOURNAL: 'NEUROLOGY_JOURNAL',
	NEJM: 'NEJM',
	PLOS: 'PLOS',
	ASH_PUBS: 'ASH_PUBS',
	EHA_JOURNAL: 'EHA_JOURNAL',
	OTHER: 'OTHER',
	PUB_MED: 'PUB_MED',
	GLOBENEWSWIRE: 'GLOBENEWSWIRE',
	BUSINESSWIRE: 'BUSINESSWIRE',
	PRNEWSWIRE: 'PRNEWSWIRE',
	ACCESSWIRE: 'ACCESSWIRE',
	NEWSFILECORP: 'NEWSFILECORP',
	NEWSWIRE: 'NEWSWIRE',
	FIERCEPHARMA: 'FIERCEPHARMA',
	FIERCEBIOTECH: 'FIERCEBIOTECH',
	ONCLIVE: 'ONCLIVE',
	ENDPTS: 'ENDPTS',
	CT_GOV: 'clinicaltrials.gov',
	IMS: 'IMS',
	ACR: 'ACR',
	EASL: 'EASL',
	GHAPP: 'GHAPP',
	AASLD: 'AASLD',
	ASN: 'ASN',
	AMCP: 'AMCP',
	ESCMID: 'ESCMID',
	UCA: 'UCA',
	AAPA: 'AAPA',
	AANP: 'AANP',
	AAFP_FMX: 'AAFP-FMX',
	IDWeek: 'IDWeek',
	AMCP_Nexus: 'AMCP-Nexus',
	ASCO_GI: 'ASCO-GI',
	ASCO_GU: 'ASCO-GU',
	IASLC: 'IASLC',
	SGO: 'SGO',
	AHNS: 'AHNS',
	ESMO_GI: 'ESMO-GI',
	JADPRO: 'JADPRO',
	SNO: 'SNO',
	NACLC: 'NACLC',
	AAAAI: 'AAAAI',
	ATS: 'ATS',
	CHEST: 'CHEST',
	ACAAI: 'ACAAI',
	SAHM: 'SAHM',
	NAPNAP: 'NAPNAP',
	PALTC_AMDA: 'PALTC-AMDA',
	APhA: 'APhA',
};

export const CONFERENCE_SOURCE_NAME = {
	ASCO: 'ASCO',
	ESMO: 'ESMO',
	AACR: 'AACR',
	ASH: 'ASH',
	EHA: 'EHA',
	IMS: 'IMS',
	ACR: 'ACR',
	EASL: 'EASL',
	GHAPP: 'GHAPP',
	AASLD: 'AASLD',
	ASN: 'ASN',
	AMCP: 'AMCP',
	ESCMID: 'ESCMID',
	UCA: 'UCA',
	AAPA: 'AAPA',
	AANP: 'AANP',
	AAFP_FMX: 'AAFP-FMX',
	IDWeek: 'IDWeek',
	AMCP_Nexus: 'AMCP-Nexus',
	ASCO_GI: 'ASCO-GI',
	ASCO_GU: 'ASCO-GU',
	IASLC: 'IASLC',
	SGO: 'SGO',
	AHNS: 'AHNS',
	ESMO_GI: 'ESMO-GI',
	JADPRO: 'JADPRO',
	SNO: 'SNO',
	NACLC: 'NACLC',
	AAAAI: 'AAAAI',
	ATS: 'ATS',
	CHEST: 'CHEST',
	ACAAI: 'ACAAI',
	SAHM: 'SAHM',
	NAPNAP: 'NAPNAP',
	PALTC_AMDA: 'PALTC-AMDA',
	APhA: 'APhA',
};

export const READOUT_CATEGORY = {
	CLINICAL: 'Clinical',
	PRECLINICAL: 'Preclinical',
	GENERAL: 'General',
};

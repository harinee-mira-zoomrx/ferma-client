import { wrap } from 'svelte-spa-router/wrap';
import Root from './Roots/Root/Root.svelte';
import Login from './Login/Login.svelte';
import { token } from '@stores/auth.store';
import { get } from 'svelte/store';
import isEmpty from '@utils/is-empty';
import Trial from './Trial/Trial.svelte';
import Trials from './Trials/Trials.svelte';
import PreclinicalTrials from './PreclinicalTrials/PreclinicalTrials.svelte';
import NewPreclinicalTrial from './PreclinicalTrials/PreclinicalTrial/new.svelte';
import PreclinicalTrial from './PreclinicalTrials/PreclinicalTrial/PreclinicalTrial.svelte';
import ApprovedStudies from './ApprovedStudies/ApprovedStudies.svelte';
import NewApprovedStudy from './ApprovedStudies/ApprovedStudy/Add.svelte';
import ApprovedStudy from './ApprovedStudies/ApprovedStudy/ApprovedStudy.svelte';
import Roots from './Roots/Roots.svelte';
import Organization from './Organization/Organization.svelte';
import BulkOperations from './BulkOperations/BulkOperations.svelte';
import Pipeline from './Pipeline/Pipeline.svelte';
import Contents from './DataReviewer/Contents/Contents.svelte';
import InsightsMaster from './DataReviewer/InsightsMaster.svelte';
import KGWorkflow from './DataReviewer/KGWorkflow.svelte';
import DrugsWorkflow from './DataReviewer/DrugsWorkflow.svelte';
import FirmsWorkflow from './DataReviewer/FirmsWorkflow.svelte';
import TrialsWorkflow from './DataReviewer/TrialsWorkflow.svelte';
import Workflow from './DataReviewer/Workflow.svelte';
import Readouts from './Readouts/Readouts.svelte';
import Readout from './Readouts/Readout/Readout.svelte';
import InvalidTerms from './InvalidTerms/InvalidTerms.svelte';
import { authorization } from '@stores/authorization.store';
import { isAuthorized } from '@models/user';


export const routes = {
	'/login': wrap({
		component: Login,
		conditions: [() => isEmpty(get(token)) || isEmpty(get(authorization)?.authorizer)],
	}),
	'/roots': wrap({
		component: Roots,
		conditions: [isAuthorized],
	}),
	'/roots/:id': wrap({
		component: Root,
		conditions: [isAuthorized],
	}),
	'/trials': wrap({
		component: Trials,
		conditions: [isAuthorized],
	}),
	'/trials/:nct_id': wrap({
		component: Trial,
		conditions: [() => !isEmpty(get(token))],
	}),
	'/preclinical-trials': wrap({
		component: PreclinicalTrials,
		conditions: [isAuthorized],
	}),
	'/preclinical-trials/new': wrap({
		component: NewPreclinicalTrial,
		conditions: [isAuthorized],
	}),
	'/preclinical-trials/:id': wrap({
		component: PreclinicalTrial,
		conditions: [isAuthorized],
	}),
	'/approved-studies': wrap({
		component: ApprovedStudies,

		conditions: [() => !isEmpty(get(token))],
	}),
	'/approved-studies/new': wrap({
		component: NewApprovedStudy,

		conditions: [() => !isEmpty(get(token))],
	}),
	'/approved-studies/:id': wrap({
		component: ApprovedStudy,

		conditions: [() => !isEmpty(get(token))],
	}),
	'/organizations': wrap({
		component: Organization,
		conditions: [isAuthorized],
	}),
	'/bulk-operations': wrap({
		component: BulkOperations,
		conditions: [isAuthorized],
	}),
	'/data-reviewer/contents': wrap({
		component: Contents,
		conditions: [isAuthorized],
	}),
	'/data-reviewer/insights-master': wrap({
		component: InsightsMaster,
		conditions: [isAuthorized],
	}),
	'/data-reviewer/kg-workflow': wrap({
		component: KGWorkflow,
		conditions: [isAuthorized],
	}),
	'/data-reviewer/drugs-workflow': wrap({
		component: DrugsWorkflow,
		conditions: [isAuthorized],
	}),
	'/data-reviewer/firms-workflow/insights/:id': wrap({
		component: Workflow,
		conditions: [isAuthorized],
	}),
	'/data-reviewer/firms-workflow/default': wrap({
		component: FirmsWorkflow,
		conditions: [isAuthorized],
	}),
	'/data-reviewer/trials-workflow/insights/:id': wrap({
		component: Workflow,
		conditions: [isAuthorized],
	}),
	'/data-reviewer/trials-workflow/default': wrap({
		component: TrialsWorkflow,
		conditions: [isAuthorized],
	}),
	'/pipeline': wrap({
		component: Pipeline,
		conditions: [isAuthorized],
	}),
	'/readouts': wrap({
		component: Readouts,
		conditions: [isAuthorized],
	}),
	'/readouts/:id': wrap({
		component: Readout,
		conditions: [isAuthorized],
	}),
	'/invalid-terms': wrap({
		component: InvalidTerms,
		conditions: [isAuthorized],
	}),
	'*': wrap({
		component: Roots,

		conditions: [() => false],
	}),
};

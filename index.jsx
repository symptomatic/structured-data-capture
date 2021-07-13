import React from 'react';

import { 
  QuestionnairesButtons,
  QuestionnaireResponsesButtons,
  SurveyButtons
} from './client/StructuredDataCaptureFooterButtons';

import StructuredDataCaptureWorkflowTabs from './client/StructuredDataCaptureWorkflowTabs';
import StructuredDataCapturePage from './client/StructuredDataCapturePage';
import SurveyExpansionPanels from './client/SurveyExpansionPanels';
import SurveyPage from './client/SurveyPage';


let DynamicRoutes = [{
  'name': 'StructuredDataCapturePage',
  'path': '/structured-data-capture',
  'component': StructuredDataCapturePage
}, {
  'name': 'SurveyPage',
  'path': '/survey',
  'component': SurveyPage
}];


let FooterButtons = [{
  pathname: '/questionnaires',
  component: <QuestionnairesButtons />
}, {
  pathname: '/questionnaire-responses',
  component: <QuestionnaireResponsesButtons />
}, {
  pathname: '/survey',
  component: <SurveyButtons />
}];

let SidebarWorkflows = [{
  primaryText: 'Structured Data Capture',
  to: '/questionnaires',
  iconName: 'ic_question_answer'
}];


let WorkflowTabs = [{
  name: "StructuredDataCaptureWorkflowTabs",
  component: <StructuredDataCaptureWorkflowTabs />,
  matchingPaths: [
    "/structured-data-capture",
    "/questionnaires",
    "/questionnaire-responses",
    "/survey"
  ]
}]


export { 
  DynamicRoutes,
  FooterButtons,

  TasksButtons,
  ListsButtons,
  QuestionnairesButtons,
  QuestionnaireResponsesButtons,
  CommunicationRequestButtons,

  SidebarWorkflows,
  WorkflowTabs,

  StructuredDataCapturePage
};

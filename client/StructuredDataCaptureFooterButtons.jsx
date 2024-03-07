import React from 'react';

import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { HTTP } from 'meteor/http';
import { Random } from 'meteor/random';

import { Button } from '@material-ui/core';

import { get } from 'lodash';
import JSON5 from 'json5';

import GravityMethods from '../lib/SdcMethods'

import exampleResponse from '../data/SDOHCC_QuestionnaireResponse_Hunger_Vital_Sign_Screening_Example_1';
import exampleCommunicationRequest from '../data/Symptomatic_CommunicationRequest_Sample';

import  { useTracker } from './Tracker';

//========================================================================================================

import {
  fade,
  ThemeProvider,
  MuiThemeProvider,
  withStyles,
  makeStyles,
  createMuiTheme,
  useTheme
} from '@material-ui/core/styles';

  // Global Theming 
  // This is necessary for the Material UI component render layer
  let theme = {
    appBarColor: "#f5f5f5 !important",
    appBarTextColor: "rgba(0, 0, 0, 1) !important",
  }

  // if we have a globally defined theme from a settings file
  if(get(Meteor, 'settings.public.theme.palette')){
    theme = Object.assign(theme, get(Meteor, 'settings.public.theme.palette'));
  }

  const muiTheme = createMuiTheme({
    typography: {
      useNextVariants: true,
    },
    palette: {
      appBar: {
        main: theme.appBarColor,
        contrastText: theme.appBarTextColor
      },
      contrastThreshold: 3,
      tonalOffset: 0.2
    }
  });


  const buttonStyles = makeStyles(theme => ({
    west_button: {
      cursor: 'pointer',
      justifyContent: 'left',
      color: theme.palette.appBar.contrastText,
      marginLeft: '20px',
      marginTop: '15px'
    },
    east_button: {
      cursor: 'pointer',
      justifyContent: 'left',
      color: theme.palette.appBar.contrastText,
      right: '20px',
      marginTop: '15px',
      position: 'absolute'
    }
  }));


Session.setDefault('SurveyPage.expandedPanels', false)    



//============================================================================================================================
// Tasks

export function TasksButtons(props){
  const buttonClasses = buttonStyles();

  function toggleLayout(){
    console.log('toggleLayout!');

    Session.toggle('QuestionnaireResponsesPage.onePageLayout')
  }
  function clearTasks(){
    Tasks.remove({});
  }
  function initializeSampleReports(){
    console.log('Initializing Sample Tasks!');

    //ReportingMethods.initializeSampleMeasureReports();
  }
  return (
    <div>
      <Button className={buttonClasses.west_button} onClick={ initializeSampleReports.bind(this) } >
        Initialize Sample Tasks
      </Button>
      <Button className={buttonClasses.west_button} onClick={ clearTasks.bind(this) } >
        Clear
      </Button>
      <Button className={buttonClasses.west_button} onClick={ toggleLayout.bind(this) } >
        Toggle Layout Screen
      </Button>
    </div>
  );
}


//============================================================================================================================
// Lists

export function ListsButtons(props){
  const buttonClasses = buttonStyles();

  function toggleLayout(){
    console.log('toggleLayout!');

    Session.toggle('ListsPage.onePageLayout')
  }
  function clearLists(){
    Lists.remove({});
  }
  function initializeSampleLists(){
    console.log('Initializing Sample Lists!');

    //ReportingMethods.initializeSampleMeasureReports();
  }
  return (
    <div>
      <Button className={buttonClasses.west_button} onClick={ initializeSampleLists.bind(this) } >
        Initialize Sample Lists
      </Button>
      <Button className={buttonClasses.west_button} onClick={ clearLists.bind(this) } >
        Clear
      </Button>
      <Button className={buttonClasses.west_button} onClick={ toggleLayout.bind(this) } >
        Toggle Layout Screen
      </Button>
    </div>
  );
}

//============================================================================================================================
// Survey Taker

export function SurveyButtons(props){
  const buttonClasses = buttonStyles();

  let draftQuestionnaireResponse;
  draftQuestionnaireResponse = useTracker(function(){
    return Session.get('draftQuestionnaireResponse')
  }, []);

  function toggleFormExpansion(){
    console.log('toggleFormExpansion');

    Session.toggle('SurveyPage.expandedPanels')    
  }

  function postQuestionnaireResponse(){
    let responseTemplate = {
      "resourceType": "QuestionnaireResponse",
      "id": Random.id(),
      "identifier": {
        "system": "https://www.symptomatic.io/fhir/Questionnaire/",
        "value": Session.get('selectedQuestionnaireId')
      },
      "questionnaire": "Questionnaire/" + Session.get('selectedQuestionnaireId'),
      "status": "completed",
      "subject": {
        "display": "Anonymous User",
        "reference": "Patient/Anonymous"
      },
      "authored": new Date(),
      "author": {
        "display": "Anonymous User",
        "reference": "Patient/Anonymous"
      },
      "source": {
        "display": get(Meteor, 'settings.public.title'),
        "reference": Meteor.absoluteUrl()
      },
      "item": [] 
    }

    let questionnaireResponseUrl = "";
    if(get(Meteor, 'settings.public.interfaces.relay.channel.endpoint')){
      questionnaireResponseUrl = get(Meteor, 'settings.public.interfaces.relay.channel.endpoint');
    } else {
      questionnaireResponseUrl = Meteor.absoluteUrl() +  'baseR4/QuestionnaireResponse/' + responseTemplate.id;
    }

    console.log('draftQuestionnaireResponse', draftQuestionnaireResponse)

    if(Array.isArray(draftQuestionnaireResponse.item)){
      responseTemplate.item = draftQuestionnaireResponse.item;
    }

    console.log('responseTemplate', responseTemplate);

    HTTP.put(questionnaireResponseUrl, {
      data: responseTemplate
    }, function(error, result){
      if (error) {
        console.log("POST /QuestionnaireResponse", error);
      }
      if (result) {
        console.log("POST /QuestionnaireResponse", result);
      }
    });

  }
  return (
    <div>
      <Button className={buttonClasses.west_button} onClick={ postQuestionnaireResponse.bind(this) } >
        Return Survey
      </Button>
      <Button className={buttonClasses.east_button} onClick={ toggleFormExpansion.bind(this) } >
        Expand / Collapse
      </Button>
    </div>
  );
}

//============================================================================================================================
// Questionnaires

export function QuestionnairesButtons(props){
  const buttonClasses = buttonStyles();

  function toggleLayout(){
    console.log('toggleLayout!');

    Session.toggle('QuestionnairesPage.onePageLayout')
  }
  function clearQuestionnaires(){
    Questionnaires.remove({});
  }
  function initializeSampleQuestionnaires(){
    console.log('Initializing Sample Questionnaires!');

    GravityMethods.initializeHungerVitalSignsQuestionnaire();
  }
  function postQuestionnaireResponse(){
    let responseTemplate = {
      "resourceType": "QuestionnaireResponse",
      "id": Random.id(),
      "identifier": {
        "system": "https://www.symptomatic.io/fhir/Questionnaire/",
        "value": Session.get('selectedQuestionnaireId')
      },
      "questionnaire": "Questionnaire/" + Session.get('selectedQuestionnaireId'),
      "status": "completed",
      "subject": {
        "display": "Anonymous User",
        "reference": "Patient/Anonymous"
      },
      "authored": new Date(),
      "author": {
        "display": "Anonymous User",
        "reference": "Patient/Anonymous"
      },
      "source": {
        "display": "Symptomatic Gravity App",
        "reference": "https://gravity.symptomatic.healthcare"
      },
      "item": [] 
    }


    let questionnaireResponseUrl = "";
    if(get(Meteor, 'settings.public.interfaces.relay.channel.endpoint')){
      questionnaireResponseUrl = get(Meteor, 'settings.public.interfaces.relay.channel.endpoint');
    } else {
      questionnaireResponseUrl = Meteor.absoluteUrl() +  'baseR4/QuestionnaireResponse/' + responseTemplate.id;
    }

    console.log('questionnaireResponseUrl', questionnaireResponseUrl)
    console.log('responseTemplate', responseTemplate)

    console.log('draftQuestionnaireResponse', Session.set('draftQuestionnaireResponse', newResponse))

    HTTP.put(questionnaireResponseUrl, {
      data: responseTemplate
    }, function(error, result){
      if (error) {
        console.log("POST /QuestionnaireResponse", error);
      }
      if (result) {
        console.log("POST /QuestionnaireResponse", result);
      }
    });

  }
  return (
    <div>
      <Button className={buttonClasses.west_button} onClick={ initializeSampleQuestionnaires.bind(this) } >
        Initialize Sample Questionnaires
      </Button>
      <Button className={buttonClasses.west_button} onClick={ clearQuestionnaires.bind(this) } >
        Clear
      </Button>
      <Button className={buttonClasses.west_button} onClick={ toggleLayout.bind(this) } >
        Toggle Layout Screen
      </Button>
      <Button className={buttonClasses.east_button} onClick={ postQuestionnaireResponse.bind(this) } >
        Post Questionnaire Response to Server
      </Button>
    </div>
  );
}


//============================================================================================================================
// Questionnaire Responses

export function QuestionnaireResponsesButtons(props){
  const buttonClasses = buttonStyles();

  function toggleLayout(){
    console.log('toggleLayout!');

    Session.toggle('QuestionnaireResponsesPage.onePageLayout')
  }
  function clearQuestionnaireResponses(){
    Meteor.call('clearQuestoinnaireResponses')
    // QuestionnaireResponses.remove({});
  }
  function initializeSampleQuestionnaireResponses(){
    console.log('Initializing Sample QuestionnaireResponses!');

    let newResponse = exampleResponse;

    delete newResponse.meta;
    delete newResponse.text;

    newResponse.id = Random.id();
    newResponse.item = [];


    let questionnaireResponseUrl = "";
    if(get(Meteor, 'settings.public.interfaces.relay.channel.endpoint')){
      questionnaireResponseUrl = get(Meteor, 'settings.public.interfaces.relay.channel.endpoint');
    } else {
      questionnaireResponseUrl = Meteor.absoluteUrl() +  'baseR4/QuestionnaireResponse/' + newResponse.id;
    }

    console.log('questionnaireResponseUrl', questionnaireResponseUrl)

    HTTP.put(questionnaireResponseUrl, {
      data: newResponse
    }, function(error, result){
      if (error) {
        console.log("POST /QuestionnaireResponse", error);
      }
      if (result) {
        console.log("POST /QuestionnaireResponse", result);
      }
    });

  }
  return (
    <div>
      {/* <Button className={buttonClasses.west_button} onClick={ initializeSampleQuestionnaireResponses.bind(this) } >
        Initialize Sample QuestionnaireResponses
      </Button> */}
      <Button className={buttonClasses.west_button} onClick={ clearQuestionnaireResponses.bind(this) } >
        Clear
      </Button>
      <Button className={buttonClasses.west_button} onClick={ toggleLayout.bind(this) } >
        Toggle Layout Screen
      </Button>
    </div>
  );
}

//============================================================================================================================
// Geocoding 

export function GeocodingButtons(props){
  const buttonClasses = buttonStyles();

  function clearGeocoding(){
    Locations.remove({});
  }
  function initializeChicagoGrocers(){
    console.log('Initializing Chicago Grocers...');

    GravityMethods.initializeChicagoGrocers();
  }
  return (
    <div>
      <Button className={buttonClasses.west_button} onClick={ initializeChicagoGrocers.bind(this) } >
        Initialize Chicago Grocers
      </Button>
    </div>
  );
}



//============================================================================================================================
// Communication Request

export function CommunicationRequestButtons(props){
  const buttonClasses = buttonStyles();

  function toggleLayout(){
    console.log('toggleLayout!');

    Session.toggle('CommunicationRequestsPage.onePageLayout')
  }
  function clearCommunicationRequests(){
    Meteor.call('clearCommunicationLogs');
  }
  function initializeSampleCommunicationRequests(){
    console.log('Initializing Sample CommunicationRequests!');

    let newCommunicationRequest = exampleCommunicationRequest;

    delete newCommunicationRequest._id;
    delete newCommunicationRequest.meta;
    delete newCommunicationRequest.text;

    newCommunicationRequest.id = Random.id();    

    let communicationRequestUrl = "";
    if(get(Meteor, 'settings.public.interfaces.relay.channel.endpoint')){
      communicationRequestUrl = get(Meteor, 'settings.public.interfaces.relay.channel.endpoint');
    } else {
      communicationRequestUrl = Meteor.absoluteUrl() +  'baseR4/CommunicationRequest/' + newCommunicationRequest.id;
    }

    console.log('communicationRequestUrl', communicationRequestUrl)
    console.log('newCommunicationRequest', newCommunicationRequest)

    

    HTTP.put(communicationRequestUrl, {
      data: newCommunicationRequest
    }, function(error, result){
      if (error) {
        console.log("POST /CommunicationRequest", error);
      }
      if (result) {
        console.log("POST /CommunicationRequest", result);
      }
    });

  }
  return (
    <div>
      <Button className={buttonClasses.west_button} onClick={ initializeSampleCommunicationRequests.bind(this) } >
        Create Sample Communication Requests
      </Button>      
      <Button className={buttonClasses.west_button} onClick={ clearCommunicationRequests.bind(this) } >
        Clear Communication Logs
      </Button>      
      {/* <Button className={buttonClasses.west_button} onClick={ toggleLayout.bind(this) } >
        Toggle Layout Screen
      </Button> */}
    </div>
  );
}



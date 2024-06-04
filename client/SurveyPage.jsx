
import { 
  Select, 
  MenuItem,
  CardContent, 
  CardHeader, 
  CardActions, 
  TextField, 
  Checkbox, 
  Button,
  Grid,
  Container,
  FormControl,
  InputLabel,
  Input,
  InputAdornment,
  FormControlLabel,
} from '@material-ui/core';

import { StyledCard, PageCanvas, FhirUtilities } from 'fhir-starter';
import SurveyExpansionPanels from './SurveyExpansionPanels';
// import SortableQuestionnaire from './SortableQuestionnaire';



import {LayoutHelpers, QuestionnairesTable, DynamicSpacer} from 'meteor/clinical:hl7-fhir-data-infrastructure';

import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';

import { Session } from 'meteor/session';
import { Random } from 'meteor/random';
import { Meteor } from 'meteor/meteor';

import moment from 'moment';
import { get, has, set } from 'lodash';

let defaultQuestionnaire = {
  index: 2,
  id: '',
  username: '',
  email: '',
  given: '',
  family: '',
  gender: ''
};

// =========================================================================================================
// Session Variables  

Session.setDefault('questionnaireFormData', defaultQuestionnaire);
Session.setDefault('questionnaireSearchFilter', '');
Session.setDefault('questionnaireDesignerCurrentQuestion', {
  linkId: 0,
  text: '',
  type: 'question',
  multiplicity: 1,
  multiline: false,
  numerical: false
});
Session.setDefault('questionnaireDesignerCurrentMultiChoice', {label: ''});
Session.setDefault('questionnaireIsSorting', false);

Session.setDefault('enableCurrentQuestionnaire', false);
Session.setDefault('activeQuestionnaireName', 'bar');
Session.setDefault('activeQuestionLinkId', false);

Session.setDefault('selectedQuestionnaireId', '')
Session.setDefault('surveyLastUpdated', new Date())

//===============================================================================================================
// Global Theming 
// This is necessary for the Material UI component render layer

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';


let theme = {
  primaryColor: "rgb(108, 183, 110)",
  primaryText: "rgba(255, 255, 255, 1) !important",

  secondaryColor: "rgb(108, 183, 110)",
  secondaryText: "rgba(255, 255, 255, 1) !important",

  cardColor: "rgba(255, 255, 255, 1) !important",
  cardTextColor: "rgba(0, 0, 0, 1) !important",

  errorColor: "rgb(128,20,60) !important",
  errorText: "#ffffff !important",

  appBarColor: "#f5f5f5 !important",
  appBarTextColor: "rgba(0, 0, 0, 1) !important",

  paperColor: "#f5f5f5 !important",
  paperTextColor: "rgba(0, 0, 0, 1) !important",

  backgroundCanvas: "rgba(255, 255, 255, 1) !important",
  background: "linear-gradient(45deg, rgb(108, 183, 110) 30%, rgb(150, 202, 144) 90%)",

  nivoTheme: "greens"
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
    primary: {
      main: theme.primaryColor,
      contrastText: theme.primaryText
    },
    secondary: {
      main: theme.secondaryColor,
      contrastText: theme.errorText
    },
    appBar: {
      main: theme.appBarColor,
      contrastText: theme.appBarTextColor
    },
    cards: {
      main: theme.cardColor,
      contrastText: theme.cardTextColor
    },
    paper: {
      main: theme.paperColor,
      contrastText: theme.paperTextColor
    },
    error: {
      main: theme.errorColor,
      contrastText: theme.secondaryText
    },
    background: {
      default: theme.backgroundCanvas
    },
    contrastThreshold: 3,
    tonalOffset: 0.2
  }
});


//===============================================================================================================
// Classes Styles Theming 

import { ThemeProvider, makeStyles } from '@material-ui/styles';
const useStyles = makeStyles(theme => ({
  button: {
    background: theme.background,
    border: 0,
    borderRadius: 3,
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    color: theme.buttonText,
    height: 48,
    padding: '0 30px',
  },
  input: {
    marginBottom: '20px'
  },
  compactInput: {
    marginBottom: '10px'
  },
  label: {
    paddingBottom: '10px'
  }
}));



// =========================================================================================================
// Main Component

export function SurveyPage(props){
  // let classes = useStyles();


  let data = {
    tabIndex: Session.get('questionnairePageTabIndex'),
    enabled: Session.get('enableCurrentQuestionnaire'),
    isSorting: Session.get('questionnaireIsSorting'),
    activeQuestionLinkId: Session.get('activeQuestionLinkId'),
    selectedQuestionnaireId: Session.get('selectedQuestionnaireId'),
    selectedQuestionnaire: Session.get('selectedQuestionnaire'),
    draftQuestionnaireResponse: Session.get('draftQuestionnaireResponse'),
    questionnaire: defaultQuestionnaire,
    questionnaireSearchFilter: '',
    currentQuestionnaire: null,
    questionnaireId: false,
    sortableItems: [],
    chatbotInstalled: false,
    questionnaireName: '',
    questionnaireDesignerCurrentQuestion: {text: ''},
    questionnaireDesignerCurrentMultiChoice: {label: ''},
    isActive: false,
    isNumber: false,
    onePageLayout: true,
    questionnaires: Questionnaires.find().fetch(),
    questionnairesCount: Questionnaires.find().count(), 
    questionnaireSearchFilter: {},
    selectedPatient: null
  };

  data.tabIndex = useTracker(function(){
    return Session.get('questionnairePageTabIndex');
  }, [])

  data.enabled = useTracker(function(){
    return Session.get('enableCurrentQuestionnaire');
  }, [])

  data.selectedPatient = useTracker(function(){
    return Session.get('selectedPatient');
  }, [])

  data.activeQuestionLinkId = useTracker(function(){
    return Session.get('activeQuestionLinkId');
  }, [])

  data.selectedQuestionnaireId = useTracker(function(){
    return Session.get('selectedQuestionnaireId');
  }, [])

  data.selectedQuestionnaire = useTracker(function(){
    return Session.get('selectedQuestionnaire');
  }, [])

  data.selectedQuestionnaireResponseId = useTracker(function(){
    return Session.get('selectedQuestionnaireResponseId');
  }, [])

  data.selectedQuestionnaireResponse = useTracker(function(){
    return Session.get('selectedQuestionnaireResponse');
  }, [])

  data.questionnaires = useTracker(function(){
    return Questionnaires.find().fetch();
  }, [])

  data.questionnairesCount = useTracker(function(){
    return Questionnaires.find().count();
  }, [])

  data.questionnaireSearchFilter = useTracker(function(){
    return Session.get('questionnaireSearchFilter');
  }, [])


  let myCarePlan = useTracker(function(){
    return CarePlans.findOne(FhirUtilities.addPatientFilterToQuery(get(Session.get('selectedPatient'), 'id'))); 
  });

  useEffect(function(){
    // read url, get questionnaire id, and set it in the session
    if(props.match && props.match.params && props.match.params.id){
      Session.set('selectedQuestionnaireId', props.match.params.id);
      Session.set('selectedQuestionnaire', Questionnaires.findOne({_id: props.match.params.id})); 
    } else {
      Session.set('selectedQuestionnaireId', get(Meteor, 'settings.public.modules.structuredDataCapture.defaultQuestionnaireId', ''));
      Session.set('selectedQuestionnaire', Questionnaires.findOne({id: get(Meteor, 'settings.public.modules.structuredDataCapture.defaultQuestionnaireId', '')}));
      Session.set('selectedQuestionnaireResponseId', get(Meteor, 'settings.public.modules.structuredDataCapture.defaultQuestionnaireResponseId', ''));
      Session.set('selectedQuestionnaireResponse', QuestionnaireResponses.findOne({id: get(Meteor, 'settings.public.modules.structuredDataCapture.defaultQuestionnaireResponseId', '')}));  
    }
  }, [])


  if (get(data, 'selectedQuestionnaire')) {
    if (get(data, 'selectedQuestionnaire.item')) {
      
      if(Array.isArray(data.selectedQuestionnaire.item)){
        let count = 0;
        data.selectedQuestionnaire.item.forEach(function(item){
          data.sortableItems.push({
            linkId: count,
            text: get(item, 'text')
          });              
          count++;
        });  
      }
    }

    if(get(data, 'selectedQuestionnaire.status') === "active"){
      data.isActive = true;
    } else {
      data.isActive = false;
    }

    // if(get(data, 'selectedQuestionnaire.title')){
    //   data.questionnaireName = get(data, 'selectedQuestionnaire.title');
    // } else {
    //   data.questionnaireName = '';
    // }
  }

  if(Session.get('activeQuestionLinkId')){
    console.log('ActiveQuestionLinkId was updated. Checking if it exists in the current questionnaire items.')
    if (Array.isArray(get(data, 'selectedQuestionnaire.item'))) {
      data.selectedQuestionnaire.item.forEach(function(item){
        if(Session.equals('activeQuestionLinkId', get(item, 'linkId', ''))){      
          console.log('Found.  Updating the question being edited.')
          data.questionnaireDesignerCurrentQuestion = item;
        }  
      });
    } 
  } 


  // ------------------------------------------------------------
  // Helper Functions

  function toggleSortStatus(){
    if(Session.equals('questionnaireIsSorting', true)){
      saveSortedQuestionnaire();
      Session.set('questionnaireIsSorting', false);
    } else {
      Session.set('questionnaireIsSorting', true);
    }    
  }
  function handleTabChange(index){
    Session.set('questionnairePageTabIndex', index);
  }
  function selectLanguage(){
    
  }
  function addChoice(){
    console.log('addChoice')
  }
  function changeText(name, event, newValue){
    console.log('changeText', this, newValue)

    Questionnaires.update({_id: get(this, 'data.currentQuestionnaire._id')}, {$set: {
      'title': newValue
    }});
  }
  function onSend(id){
    let patient = QuestionnaireResponses.findOne({_id: id});

    console.log("QuestionnaireResponseTable.onSend()", patient);

    var httpEndpoint = "http://localhost:8080";
    if (get(Meteor, 'settings.public.interfaces.default.channel.endpoint')) {
      httpEndpoint = get(Meteor, 'settings.public.interfaces.default.channel.endpoint');
    }
    HTTP.post(httpEndpoint + '/QuestionnaireResponse', {
      data: patient
    }, function(error, result){
      if (error) {
        console.log("error", error);
      }
      if (result) {
        console.log("result", result);
      }
    });
  }
  function saveQuestion(event, activeQuestionLinkId){
    console.log('Saving question to Questionnaire/', get(this, 'data.currentQuestionnaire._id'))
    console.log(' ')
    console.log('Going to try to add the following item: ');
    console.log(Session.get('questionnaireDesignerCurrentQuestion'));
    console.log(' ')
    console.log('ActiveQuestionLinkId',  data.activeQuestionLinkId);
    console.log(' ')

    let currentItemsArray = get(this, 'data.currentQuestionnaire.item', []);
    console.log('Current questionnaire items:', currentItemsArray)

    let newItems = [];
    if(Array.isArray(currentItemsArray)){
      console.log('Iterating through current items')
      currentItemsArray.forEach(function(item){
        if(Session.equals('activeQuestionLinkId', item.linkId)){
          console.log('Found a match.  Using dirty state.')
          newItems.push(Session.get('questionnaireDesignerCurrentQuestion'));
        } else {
          console.log('No match.  Using the original.')
          newItems.push(item);
        }
      });
    }

    console.log('New items.  Adding to questionnaire.', newItems)
    Questionnaires.update({_id: get(this, 'data.currentQuestionnaire._id')}, {$set: {
      'item': newItems
    }})  
  }
  function addQuestion(event, bar, baz){
    console.log('Adding a question to Questionnaire/', get(this, 'data.currentQuestionnaire._id'))
    console.log(' ')
    console.log('Going to try to add the following item: ');
    console.log(Session.get('questionnaireDesignerCurrentQuestion'));
    console.log(' ')
    console.log('Output of current Questionnaire', get(this, 'data.currentQuestionnaire'))
    
    let itemsArray = get(this, 'data.currentQuestionnaire.item', []);
    let newItem = Session.get('questionnaireDesignerCurrentQuestion')
    
    if(itemsArray.length === 0){
      newItem.linkId = 1;
    } else {
      newItem.linkId = Random.id();
    }
    
    console.log(' ')
    console.log("This is the new item we've generated and will be attaching to the questionnaire: ", newItem)
    console.log(' ')

    Questionnaires.update({_id: get(this, 'data.currentQuestionnaire._id')}, {$addToSet: {
      'item': newItem
    }})    
  }
  function returnCurrentlySelectedQuestionItem(event){
    console.log('Returning currently selected Question Item')
    return '';
  }
  function updateQuestionText(event, newValue){
    // console.log('record id', get(this, 'data.currentQuestionnaire._id'))
    console.log('updateQuestionText', newValue)

    let newQuestionState = Session.get('questionnaireDesignerCurrentQuestion');
    newQuestionState.text = newValue;

    Session.set('questionnaireDesignerCurrentQuestion', newQuestionState);
    console.log('newQuestionState', newQuestionState)
  }
  function handleSaveQuestionnaireResponse(){
    
    console.log('Sending questionnaire to external system...')

    console.log("selectedQuestionnaireResponse",  get(data, "selectedQuestionnaireResponse"));



    if(get(data, "selectedQuestionnaireResponse")){
      // let newQuestionnaireResponse = data.draftQuestionnaireResponse;

      // set(newQuestionnaireResponse, 'subject', Meteor.currentUserReference())
      // set(newQuestionnaireResponse, 'author', Meteor.currentUserReference())

      // console.log('Posting questionnaire response to external system...', newQuestionnaireResponse)
  
      let relayUrl = get(Meteor, 'settings.public.interfaces.fhirRelay.channel.endpoint', 'http://localhost:3000/baseR4') + '/QuestionnaireResponse';
      console.log('SurveyPage.relayUrl', relayUrl)
  
      Meteor.call('postRelay', relayUrl, {
        payload: get(data, "selectedQuestionnaireResponse", {})
      }, function(error, response){
        if(error){
          console.log('error', error)
        }
        if(response){
          console.log('response', response)
          alert('Success?')
        }
      })  
      // props.history.replace('/healthflow-home')
    } else {
      alert('No questionnaire response yet.')
    }
  }
  function handleToggleStatus(event, foo, bar){
    console.log('handleToggleStatus', event, foo, bar);
    console.log('handleToggleStatus.state',  state);

    setState({
      status: 'foo',
      optionIsChecked: ! state.optionIsChecked
    })
    
  }

  // ------------------------------------------------------------
  // Render

  let classes = {
    button: {
      background: theme.background,
      border: 0,
      borderRadius: 3,
      boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
      color: theme.buttonText,
      height: 48,
      padding: '0 30px',
    },
    input: {
      marginBottom: '20px'
    },
    compactInput: {
      marginBottom: '10px'
    },
    label: {
      paddingBottom: '10px'
    }
  }

  let headerHeight = LayoutHelpers.calcHeaderHeight();

  return (
    <PageCanvas id="questionnairesPage" headerHeight={headerHeight} paddingLeft={20} paddingRight={20} >
      <MuiThemeProvider theme={muiTheme} >

        <Grid container spacing={2} alignItems="center" alignContent="center" justify="center">
          <Grid item xs={12} md={3} >

          </Grid>
          <Grid item xs={12} md={6} >
            <Grid style={{position: 'sticky', top: '0px', margin: '20px', marginBottom: '84px'}}>
              <h1 className="barcode helveticas" style={{whiteSpace: 'nowrap'}}>{ data.selectedQuestionnaireId}</h1>
              <StyledCard margins={20}>
                <CardContent>
                  <FormControl style={{width: '100%', marginTop: '20px'}}>
                    <InputAdornment 
                      style={classes.label}
                    >Questionnaire Title</InputAdornment>
                    <Input
                      id="publisherInput"
                      name="publisherInput"
                      style={classes.input}
                      value={ get(data, 'selectedQuestionnaireResponse.title', '') }
                      onChange={  changeText.bind(this, 'title')}
                      fullWidth              
                    />       
                  </FormControl>    
                  <Grid container spacing={8}>

                    <Grid item xs={6} md={3}>
                      <FormControl style={{width: '100%', marginTop: '20px'}}>
                        <InputAdornment 
                          style={classes.label}
                        >Date</InputAdornment>
                        <Input
                          id="dateInput"
                          name="dateInput"
                          style={classes.input}
                          value={ moment().format("YYYY-MM-DD") }
                          fullWidth              
                        />       
                      </FormControl>    
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <FormControl style={{width: '100%', marginTop: '20px'}}>
                        <InputAdornment 
                          style={classes.label}
                        >Status</InputAdornment>
                        <Input
                          id="statusInput"
                          name="statusInput"
                          style={classes.input}
                          value={ get(data, 'selectedQuestionnaireResponse.status', '') }
                          fullWidth              
                        />       
                      </FormControl>    
                    </Grid>
                  </Grid>
                </CardContent>
              </StyledCard>
              <DynamicSpacer />
              <DynamicSpacer />

              <SurveyExpansionPanels 
                id='questionnaireDetails' 
                selectedQuestionnaire={ get(data, "selectedQuestionnaire")} 
                selectedQuestionnaireId={ get(data, "selectedQuestionnaireId")}
                selectedQuestionnaireResponse={ get(data, "selectedQuestionnaireResponse") } 
                selectedQuestionnaireResponseId={ get(data, "selectedQuestionnaireResponseId") }
                autoExpand={true}
                />


              <DynamicSpacer />
              <Button id='saveAnswersButton' onClick={ handleSaveQuestionnaireResponse.bind(this)} color="primary" variant="contained" fullWidth>Submit Questionnaire Response</Button>
              

            </Grid>

          </Grid>
          <Grid item xs={12} md={3} >
            Last saved: 
          </Grid>
        </Grid>
      </MuiThemeProvider>         
    </PageCanvas>
  );
}



export default SurveyPage;
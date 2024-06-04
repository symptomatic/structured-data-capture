import React, { useState, useEffect } from 'react';

import { 
  Button,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  ExpansionPanelActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Input,
  InputAdornment,
  FormControlLabel,
  Typography,
  Checkbox,
  TextField,
  Icon,
  CardContent,
  Box
} from '@material-ui/core';
import { withStyles, makeStyles } from '@material-ui/core/styles';

import { get, has, uniq, compact, cloneDeep, inRange, set } from 'lodash';
import moment from 'moment';

import { DynamicSpacer, FhirUtilities, PageCanvas, StyledCard } from 'fhir-starter';

// import { ReactMeteorData, useTracker } from 'meteor/react-meteor-data';
// import ReactMixin from 'react-mixin';
import PropTypes from 'prop-types';

import { Questionnaires } from 'meteor/clinical:hl7-fhir-data-infrastructure';
import { useTracker } from 'meteor/react-meteor-data';

import { Session } from 'meteor/session';
import {
  SortableContainer,
  SortableElement,
  arrayMove,
} from 'react-sortable-hoc';

import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

import walk from 'tree-walk'


let defaultQuestionnaire = {
  "resourceType" : "Questionnaire"
};

// icons
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// import { Icon } from 'react-icons-kit'
import { ic_reorder } from 'react-icons-kit/md/ic_reorder'
import { render } from 'react-dom';


//===========================================================================
// THEMING


// // A style sheet
const useStyles = makeStyles({
  'MuiExpansionPanel-root': {
    '&:before': {
      backgroundColor: 'rgba(0,0,0,0)'
    }
  },
  'root': {
    '&:before': {
      backgroundColor: 'rgba(0,0,0,0)'
    }
  }
});


let responseTemplate = {
  "resourceType": "QuestionnaireResponse",
  "identifier": {
    "system": "https://www.symptomatic.io/fhir/Questionnaire/"
  },
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

if(Meteor.isClient){
  responseTemplate.identifier.value;
  responseTemplate.questionnaire = "Questionnaire/" + Session.get('selectedQuestionnaireId');
}

// ====================================================================================================================
// Session Variables  

Session.setDefault('questionnaireUpsert', false);
Session.setDefault('selectedQuestionnaire', null);
Session.setDefault('sortableItems', []);
// Session.setDefault('draftResponse', responseTemplate );
Session.setDefault('showBarcodes', false);

// ====================================================================================================================
// Styled Component  


// The `withStyles()` higher-order component is injecting a `classes`
// prop that is used by the `Button` component.
const StyledExpansionPanel = withStyles({
  root: {
    '&:before': {
      backgroundColor: 'rgba(0,0,0,0)'
    }
  }
})(ExpansionPanel);

// ====================================================================================================================
// Main Component  


function SurveyExpansionPanels(props){

  const classes = useStyles(props);

  let { 
    children, 
    selectedQuestionnaire,
    selectedQuestionnaireId,
    selectedQuestionnaireResponse,
    selectedQuestionnaireResponseId,
    sortableItems,
    ...otherProps 
  } = props;

  let [currentResponse, setCurrentResponse] = useState(selectedQuestionnaireResponse);  

  let [draftResponse, setDraftResponse] = useState(responseTemplate);
  let [checkboxChecked, setCheckbox] = useState({item: [{answer: []}, {answer: []}, {answer: []}, {answer: []}, {answer: []}]});
  let [orderOfItems, setOrderOfItems] = useState([]);

  let [newAnswer, setNewAnswer] = useState('');
  let [currentLinkIdPath, setCurrentLinkIdPath] = useState('');
  let [currentLinkId, setCurrentLinkId] = useState('');

  let [expandedPanel, setExpandedPanel] = React.useState(false);

  // ================================================================================
  // Startup

  if(selectedQuestionnaire){

    responseTemplate.questionnaire = "Questionnaire/" + selectedQuestionnaireId;
    responseTemplate.item = get(selectedQuestionnaire, 'item', []);

    if(Array.isArray(responseTemplate.item)){
      responseTemplate.item.forEach(function(sectionItem, index){
        sectionItem.answer = [];

        if(Array.isArray(sectionItem.item)){
          sectionItem.item.forEach(function(question, questionIndex){
            question.answer = [];
          });
        }  
      })
    }

    // setDraftResponse(responseTemplate);
  }

  // useEffect(function(){
  //   if(selectedQuestionnaire){

  //     responseTemplate.questionnaire = "Questionnaire/" + selectedQuestionnaireId;
  //     responseTemplate.item = get(selectedQuestionnaire, 'item', []);

  //     if(Array.isArray(responseTemplate.item)){
  //       responseTemplate.item.forEach(function(sectionItem, index){
  //         sectionItem.answer = [];

  //         if(Array.isArray(sectionItem.item)){
  //           sectionItem.item.forEach(function(question, questionIndex){
  //             question.answer = [];
  //           });
  //         }  
  //       })
  //     }
  
  //     setDraftResponse(responseTemplate);
  //   }
  // }, [props.lastUpdated])

  useEffect(function(){
    // console.debug('draftResponse[lastUpdated]', draftResponse);

    // if(selectedQuestionnaire){
    //   let orderOfItems = [];
    //   if(Array.isArray(selectedQuestionnaire.item)){
    //     selectedQuestionnaire.item.forEach(function(item){
    //       orderOfItems.push(item.linkId);
    //     })
    //   }
    // }
    // setOrderOfItems(orderOfItems);

  }, [])

  // ================================================================================
  // Trackers

  let lastUpdated = "";
  lastUpdated = useTracker(function(){
    return Session.get('lastUpdated');
  }, [])

  let expandedPanels = useTracker(function(){
    return Session.get('SurveyPage.expandedPanels')    
  }, [])

  let showExplanation = useTracker(function(){
    return Session.get('SurveyPage.showExplanation')
  }, [])

  let showBarcodes = useTracker(function(){
    return Session.get('showBarcodes')
  }, [])


  // ================================================================================
  // Styling

  let styles = {
    identifier: {
      fontWeight: 'bold',
      maxWidth: '100px',
      textOverflow: 'elipsis',
      overflow: 'hidden',
      display: 'flex'
    },
    description: {
      position: 'relative',
      marginLeft: '20px',
      marginRight: '20px'
    },
    expansionPanel: {
      backgroundColor: 'rgba(0,0,0,0) !important'
      //marginRight: '40px'
    },
    summary: {
      content: {
        alignItems: 'center',
        verticalAlign: 'middle'  
      }
    }
  }

  if(!expandedPanels){
    // styles.expansionPanel.borderBottom = '0px solid lightgray'
  }

  let noWrap = false;
  if(window.innerWidth < 768){
    styles.expansionPanel.marginRight = '0px'
    styles.identifier.display = 'none'
    styles.description.maxWidth = (window.innerWidth - 100) + 'px'
    styles.description.marginLeft = '0px'
    styles.description.marginRight = '0px'
    styles.description.marginTop = '-10px'
    styles.summary.content.verticalAlign = 'top';
    styles.summary.content.height = '56px'
    noWrap = true;
  }




  function handleToggleItem(selectedLinkId, selectedValueCoding){
    console.debug('----------------------------------------------------------------------------')
    console.debug('SurveyExpansionPanels.handleToggleItem', selectedLinkId, selectedValueCoding)
    console.debug('SurveyExpansionPanels.handleToggleItem.draftResponse', draftResponse)

    let newResponse = cloneDeep(draftResponse);
    
    
    if(Array.isArray(newResponse.item)){
      newResponse.item.forEach(function(sectionItem, sectionItemIndex){       
        
        console.debug('sectionItem.linkId', get(sectionItem, 'linkId'))
        let newSectionAnswer = [];
        
        if(get(sectionItem, 'linkId') === selectedLinkId){
          console.debug('match!')
          newSectionAnswer.push({
            valueCoding: selectedValueCoding
          })
          console.debug('newSectionAnswer!', newSectionAnswer);

          let newSectionItem = newResponse.item[sectionItemIndex];
          delete newSectionItem.answer;
          newSectionItem.answer = newSectionAnswer;
          console.debug('newSectionItem!', newSectionItem);

          newResponse.item[sectionItemIndex] = newSectionItem;
          console.debug('newResponse!', newResponse)
          Session.set('draftQuestionnaireResponse', newResponse)

        } else if(Array.isArray(sectionItem.item)){
          sectionItem.item.forEach(function(question, questionIndex){

            let newQuestionAnswer = [];
            if(get(question, 'linkId') === selectedLinkId){
              console.debug('question match!')
              newQuestionAnswer.push({
                valueCoding: selectedValueCoding
              })
              newResponse.item[sectionItemIndex].item[questionIndex].answer = newQuestionAnswer;
            }
          })            
        }        
        
      })

      console.debug('SurveyExpansionPanels.handleToggleItem.newResponse', newResponse)
      Session.set('lastUpdated', new Date())
      setDraftResponse(newResponse) 
    }    
  }

  function handleToggleCheckbox(renderItemIndex, event, newValue){
    console.debug('handleToggleCheckbox', renderItemIndex, event, newValue)

    console.debug('checkboxChecked', checkboxChecked);
    console.debug('!checkboxChecked[renderItemIndex]', !checkboxChecked[renderItemIndex]);

    let newCheckboxObject = {item: []};
    if(Array.isArray(checkboxChecked.item)){
      checkboxChecked.item.forEach(function(questionAnswerItem, index){        
        if(index === renderItemIndex){
          let newAnswer = [];
          if(questionAnswerItem.answer.length > 0){
            newAnswer = [];
          } else {
            newAnswer = ["Foo"]
          }
          newCheckboxObject.item[renderItemIndex] = {answer: newAnswer}
        } else {
          newCheckboxObject.item = {answer: []}
        }
      })
    }
    console.debug('newCheckboxObject', newCheckboxObject);

    setCheckbox(newCheckboxObject);
  }

  function generateAnswerOptions(answerChoices, currentQuestion){
    // console.debug('----------------------------------------------------------------------------')
    // console.debug('SurveyExpansionPanels.generateAnswerOptions')

    if(Array.isArray(currentQuestion.answerOption)){

      // does this section element have answers?            
      if(currentQuestion.answerOption.length > -1){
        // for each answer we render, we are going to need to figure out 
        // if the answer has been selected
        currentQuestion.answerOption.forEach(function(option, index){
          // console.debug('SurveyExpansionPanels.answerOptions.option', option)

          let optionIsChecked = false;

          if(Array.isArray(currentQuestion.answer)){
            currentQuestion.answer.forEach(function(answer){
              if(get(answer, 'valueCoding.code') === get(option, 'valueCoding.code')){
                optionIsChecked = true;
              }
            })
          }

          let answers = get(currentQuestion, 'answer', []);
          let explanationElements = [];
          if(Array.isArray(answers)){
            answers.forEach(function(answer){
              if(get(answer, 'valueCoding.code') === get(option, 'valueCoding.code')){
                // explanationElements.push(<Typography>{get(answer, 'valueCoding.display')}</Typography>)
                explanationElements.push(<DynamicSpacer />)
                explanationElements.push(<Box className="checkboxLabel">
                  <CardContent>
                    { get(option, 'valueCoding.display') }
                  </CardContent>
                </Box>)
              }
            })
          }

          answerChoices.push(<ListItem style={{paddingLeft: '120px'}} key={get(currentQuestion, 'linkId') + '-answer-' + index}>
            <ListItemIcon>
              <Checkbox checked={optionIsChecked} onChange={handleToggleItem.bind(this, get(currentQuestion, 'linkId'), get(option, 'valueCoding'))} />
            </ListItemIcon>
            <ListItemText>
              { get(option, 'valueCoding.display') }
              {/* { explanationElements }                 */}
            </ListItemText>
          </ListItem>);
        })
      }

    } 
  }

  // we're going to get a question, along with the indices for where it exists in the hierarcy, up to two levels deep
  function parseQuestion(sectionIndex, questionIndex){
    console.debug('Parsing questions', sectionIndex, questionIndex)

    let answerChoices = [];  

    let queryPluckString = "";
                    
    if(questionIndex > -1){
      queryPluckString = 'item[' + sectionIndex + '].item[' + questionIndex + ']';
    } else {
      queryPluckString = 'item[' + sectionIndex + ']';
    }

    console.debug('queryPluckString', queryPluckString)
    let currentQuestion = get(currentResponse, queryPluckString)
    console.debug('currentQuestion', currentQuestion)

    if(currentQuestion){
      // is this a section element?
      if(Array.isArray(currentQuestion.answerOption)){

        generateAnswerOptions(answerChoices, currentQuestion);

      } else {

        // assuming this is a subelement        
        if(Array.isArray(currentQuestion.item)){
          currentQuestion.item.forEach(function(subQuestion){
            generateAnswerOptions(answerChoices, subQuestion);
          })
        }
      }

    }

    return answerChoices;
  }

  function clearField(renderItem){
    console.log('------------------------------------------------------')
    console.info('Clearing item')

    console.info('')
    console.info('renderItem', renderItem)
    console.info('currentResponse', currentResponse)
    console.info('')
    console.info('selectedLinkId', get(renderItem, 'linkId'))
    console.info('currentLinkId', currentLinkId)
    console.info('currentLinkIdPath', currentLinkIdPath)
    console.info('');

    let answerPath = "";

    if(currentLinkIdPath){
      answerPath = currentLinkIdPath + ".answer";
    }  

    console.info('');
    console.log('answerPath', answerPath.replace('_document.', ''));
    console.info('');
    console.info('Question: ' + get(currentResponse, currentLinkIdPath + ".text", ''));
    console.info('Answer Query Path: ', answerPath + "[0].valueString");
    console.info('Answer: ', get(currentResponse, answerPath + "[0].valueString", ''));
    console.info('');

    let updatedResponse = cloneDeep(currentResponse);
    set(updatedResponse, answerPath, [])

    console.log('updatedResponse', updatedResponse);

    setCurrentResponse(updatedResponse)
    Session.set('selectedQuestionnaireResponse', updatedResponse);

    QuestionnaireResponses._collection.update({_id: get(updatedResponse, '_id')}, {$set: updatedResponse}, function(error, result){
      if(error){
        console.error('QuestionnaireResponses._collection.update', error)
      }
      if(result){
        console.log('QuestionnaireResponses._collection.update', result)
      }
    });
  }
  function acceptItem(renderItem){
    console.log('------------------------------------------------------')
    console.info('Accept item')
    console.info('')
    console.info('renderItem', renderItem)
    console.info('renderItem.linkId', get(renderItem, 'linkId'))
    console.info('currentResponse', currentResponse)
    console.info('')
    
    let selectedLinkId = get(renderItem, 'linkId');
    
    let parentMatch = null;


    if((selectedLinkId !== currentLinkId) || (currentLinkIdPath === "")){
      let selectedLinkIdPath = "";

      walk.postorder(currentResponse, function(value, key, parent) {
        // console.log(key + ': ' + value);
        if(key === 'linkId'){
          if(value === selectedLinkId){
            selectedLinkIdPath = "linkId"
            parentMatch = parent;
          }
        }
        
        console.log('parent', parent);
        console.log('parent.typeof', typeof parent);
        console.log('parent.isArray', Array.isArray(parent));
  
        if(key == parentMatch){
          console.log('key matches parentMatch', parentMatch)
        }
        if(value == parentMatch){
          console.log('value matches parentMatch', parentMatch)
          if(typeof key !== "undefined"){
            selectedLinkIdPath = key + '.' + selectedLinkIdPath;
          }
  
          parentMatch = parent;
        }
  
      });

      setCurrentLinkId(get(renderItem, 'linkId'))
      setCurrentLinkIdPath(selectedLinkIdPath.replace('_document.', ''))
    }

    console.info('');
    console.info('currentLinkIdPath', currentLinkIdPath);
    console.info('currentResponse', currentResponse)
    console.info('');
    console.info('Question: ' + get(currentResponse, currentLinkIdPath, ''));
    console.info('Answer Query Path: ', currentLinkIdPath.replace('linkId', 'answer').replace('_document._document.', ''));
    console.info('Answer: ', get(currentResponse, currentLinkIdPath.replace('linkId', 'answer').replace('_document._document.', ''), ''));
    console.info('');
    console.info('');

    set(currentResponse, currentLinkIdPath.replace('linkId', 'answer').replace('_document._document.', ''), [])
  }

  function handleEditAnswer(renderItem, event){
    // console.log('------------------------------------------------------')
    // console.info('Handle Edit Item')
    // console.info('renderItem', renderItem)
    // console.info('event', event.currentTarget.value);

    let answerPath = "";

    if(currentLinkIdPath){
      answerPath = currentLinkIdPath + ".answer";
    }  

    // console.info('currentLinkIdPath', currentLinkIdPath);
    // console.info('currentResponse', currentResponse)
    // console.info('');
    // console.info('Question: ' + get(currentResponse, currentLinkIdPath + ".text", ''));
    // console.info('Answer Query Path: ', answerPath + "[0].valueString");
    // console.info('Answer: ', get(currentResponse, answerPath + "[0].valueString", ''));
    // console.info('');

    // console.info('');
    // console.info('Question: ' + get(currentResponse, currentLinkIdPath, ''));
    // console.info('Answer Query Path: ', currentLinkIdPath.replace('linkId', 'answer').replace('_document.', ''));
    // console.info('Answer: ', get(currentResponse, currentLinkIdPath.replace('linkId', 'answer').replace('_document.', ''), ''));
    // console.info('');

    if(currentResponse){
      let updatedResponse = cloneDeep(currentResponse);
      // let updatedResponse = currentResponse;
      set(updatedResponse, answerPath, [{valueString: event.currentTarget.value}])
      // console.info('updatedResponse', updatedResponse)

      setCurrentResponse(updatedResponse)
      Session.set('selectedQuestionnaireResponse', updatedResponse);      
    }
  }

  function handleChange(linkId, event, isExpanded){
    console.log('handleChange', linkId, event, isExpanded)

    setExpandedPanel(isExpanded ? linkId : false);
  };

  function calculateLinkIdPath(renderItem){
    console.info('Calculating linkId path...', renderItem)

    let selectedLinkIdPath = "";
    let selectedLinkId = get(renderItem, 'linkId');
    console.info('selectedLinkId', selectedLinkId);

    walk.postorder(currentResponse, function(value, key, parent) {
      console.debug(key + ': ' + value);
      if(key){
        if(key === 'linkId'){
          if(value === selectedLinkId){
            selectedLinkIdPath = "linkId"
            parentMatch = parent;
          }
        }
        
        // console.debug('parent', parent);
        // console.debug('parent.typeof', typeof parent);
        // console.debug('parent.isArray', Array.isArray(parent));
  
        if(key == parentMatch){
          // console.info('key matches parentMatch', parentMatch)
        }
        if(value == parentMatch){
          // console.info('value matches parentMatch', parentMatch)
          if(typeof key !== "undefined"){
            selectedLinkIdPath = key + '.' + selectedLinkIdPath;
          }
  
          parentMatch = parent;
        }
      }
    });

    setCurrentLinkId(get(renderItem, 'linkId'))
    setCurrentLinkIdPath(selectedLinkIdPath.replace('_document.', '').replace('.linkId', ''))

    console.log("Link Path:  " + selectedLinkIdPath.replace('_document.', '').replace('.linkId', ''))
    // alert("Link Path:  " + selectedLinkIdPath)
  }

  function parseMultipleChoice(renderItem){
    console.debug('parseMultipleChoice')

    console.debug('textNormalForm', textNormalForm);
    console.debug('renderItem', renderItem);
    console.debug('renderItem.answer.0.valueString', get(renderItem, 'answer.0.valueString'));



    
  }



  // Forms with Functional React Components
  // Pros:  React internal state works really well
  // Cons:  FHIR QuestionnaireResponses store answers in arrays
  // Solution:  Helper methods (eventually)
  // Kludge: In the meantime, we have this gnarly thing to deal with

  // do we have question items to display in expansion panels
  console.debug('===========================================================================================')
  console.debug('SurveyExpansionPanels.selectedQuestionnaire', selectedQuestionnaire)
  console.debug('SurveyExpansionPanels.selectedQuestionnaireResponse', selectedQuestionnaireResponse)
  console.debug('SurveyExpansionPanels.draftResponse (pre main render)', draftResponse)

  let questionPanels = [];




  let barcodeClassname = "";
  if(showBarcodes){
    barcodeClassname = "barcode barcodes";
  }


  if(currentResponse){
    if(Array.isArray(currentResponse.item)){



      currentResponse.item.forEach(function(renderItem, renderItemIndex){
        if(renderItem){
          // console.debug('renderItem', renderItem)
  
          let answerChoices = [];
          
          let linkIdElement;
          // if(expandedPanels){
          //   linkIdElement = <div class="barcode barcodes" style={{ animation: "fadeIn 5s" }}>
          //     {get(renderItem, 'linkId')}
          //   </div>
          // }
          
          // are we starting with section headers or actual questions
          // looks like we have actual questions
          if(Array.isArray(renderItem.answerOption)){
            answerChoices = parseQuestion(renderItemIndex, -1);
    
            let questionExplanation = "";
            if(Array.isArray(renderItem.answer)){
              renderItem.answer.forEach(function(answer){
                if(get(answer, 'valueString')){
                  questionExplanation = get(answer, 'valueString');
                }
              });
            }
            
            questionPanels.push(<StyledExpansionPanel className="MuiExpansionPanel" expanded={expandedPanels ? true : (expandedPanel === get(renderItem, 'linkId'))} onClick={calculateLinkIdPath.bind(this, renderItem)} onChange={handleChange.bind(this, (get(renderItem, 'linkId')))} classes={{ root: 'ExpansionPanel' }} key={'expansionPanel-topLevel-' + renderItemIndex}>
              {linkIdElement}
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} aria-controls={'expansionPanel-topLevel-' + renderItemIndex + "-content"} id={'expansionPanel-topLevel-' + renderItemIndex + "-header"}  style={styles.summary} >
                <Typography>
                  <h4 className={barcodeClassname} style={{margin: '0px', fontWeight: 200}}>{get(renderItem, 'linkId')}</h4><p style={{margin: '0px'}}>{get(renderItem, 'text')}</p>
                </Typography>
              </ExpansionPanelSummary>
              {/* <ExpansionPanelDetails>
                <TextField
                    id="standard-choice"
                    // label={get(renderItem, 'text')}
                    style={{marginLeft: '20px'}}
                    onChange={handleEditAnswer.bind(this, renderItem)}
                    value={get(renderItem, 'answer.0.valueString', '')}
                    fullWidth
                  />
              </ExpansionPanelDetails> */}
              <ExpansionPanelDetails className="measure-details" style={{display: 'block'}}>
                <List>
                  { answerChoices }
                </List>
                <DynamicSpacer />
                {/* { get(renderItem, 'answer.0.valueString') ? <Typography>{get(renderItem, 'answer.0.valueString')}</Typography> : null } */}
                <DynamicSpacer />
                <Box className="explainability" sx={{bgcolor: '#eeeeee', width: '100%'  }}>
                  <CardContent>
                    <TextField
                      id="standard-basic"
                      label={"Explanation for item " + get(renderItem, 'linkId')}
                      sx={{marginLeft: '20px'}}
                      onChange={handleEditAnswer.bind(this, renderItem)}
                      value={showExplanation ? JSON.stringify(renderItem, null, 2) : questionExplanation }
                      multiline={true}
                      fullWidth
                    />   
                  </CardContent>
                </Box>
              </ExpansionPanelDetails>
              <ExpansionPanelActions>
                {/* <Button startIcon={<FormatListBulletedIcon />}style={{float: 'right'}} onClick={parseMultipleChoice.bind(this, renderItem)}>Parse Multiple Choice</Button> */}
                <Button startIcon={<CheckIcon />} onClick={acceptItem.bind(this, renderItem)} >Accept</Button>
                <Button startIcon={<ClearIcon />} onClick={clearField.bind(this, renderItem)} >Clear</Button>
              </ExpansionPanelActions>         
            </StyledExpansionPanel>)   
    
    

          } else {
            // section titles
            console.debug('SurveyExpansionPanels.sectionTitle', get(renderItem, 'text'))
            
            switch (get(renderItem, 'type')) {
              case "date":
                // testing this one
                // questionPanels.push(<StyledExpansionPanel className={{root: "MuiExpansionPanel"}} expanded={expandedPanels ? true : (expandedPanel === get(renderItem, 'linkId'))} onClick={calculateLinkIdPath.bind(this, renderItem)} onChange={handleChange.bind(this, (get(renderItem, 'linkId')))} key={'expansionPanel-topLevel-' + renderItemIndex}>
                questionPanels.push(<StyledExpansionPanel className="MuiExpansionPanel" expanded={expandedPanels ? true : (expandedPanel === get(renderItem, 'linkId'))} onClick={calculateLinkIdPath.bind(this, renderItem)} onChange={handleChange.bind(this, (get(renderItem, 'linkId')))} key={'expansionPanel-topLevel-' + renderItemIndex}>
                  {linkIdElement}
                  <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} aria-controls={'expansionPanel-topLevel-' + renderItemIndex + "-content"} id={'expansionPanel-topLevel-' + renderItemIndex + "-header"} style={styles.summary}  >
                    <Typography>
                      <h4 className={barcodeClassname} style={{margin: '0px', fontWeight: 200}}>{get(renderItem, 'linkId')}</h4><p style={{margin: '0px'}}>{get(renderItem, 'text')}</p>
                    </Typography>
                  </ExpansionPanelSummary>   
                  <ExpansionPanelDetails>
                    <TextField
                      id="standard-basic"
                      // label={get(renderItem, 'text')}
                      style={{marginLeft: '20px'}}
                      onChange={handleEditAnswer.bind(this, renderItem)}
                      value={get(renderItem, 'answer.0.valueString', new Date())}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      type="date"
                      fullWidth
                    />
                  </ExpansionPanelDetails>
                  <ExpansionPanelActions>
                    <Button className="dateAcceptButton" startIcon={<CheckIcon />} onClick={acceptItem.bind(this, renderItem)} >Accept</Button>
                    <Button className="dateClearButton" startIcon={<ClearIcon />} onClick={clearField.bind(this, renderItem)} >Clear</Button>
                  </ExpansionPanelActions>                  
                </StyledExpansionPanel>)                     
                break; 
              case "string":
                // questionPanels.push(<StyledExpansionPanel className={{root: "MuiExpansionPanel"}} expanded={expandedPanels ? true : (expandedPanel === get(renderItem, 'linkId'))} onClick={calculateLinkIdPath.bind(this, renderItem)} onChange={handleChange.bind(this, (get(renderItem, 'linkId')))} key={'expansionPanel-topLevel-' + renderItemIndex}>
                questionPanels.push(<StyledExpansionPanel className="MuiExpansionPanel" expanded={expandedPanels ? true : (expandedPanel === get(renderItem, 'linkId'))} onClick={calculateLinkIdPath.bind(this, renderItem)} onChange={handleChange.bind(this, (get(renderItem, 'linkId')))} key={'expansionPanel-topLevel-' + renderItemIndex}>
                  {linkIdElement}
                  <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} aria-controls={'expansionPanel-topLevel-' + renderItemIndex + "-content"} id={'expansionPanel-topLevel-' + renderItemIndex + "-header"} style={styles.summary}  >
                    <Typography>
                      <h4 className={barcodeClassname} style={{margin: '0px', fontWeight: 200}}>{get(renderItem, 'linkId')}</h4><p style={{margin: '0px'}}>{get(renderItem, 'text')}</p>
                    </Typography>
                  </ExpansionPanelSummary>   
                  <ExpansionPanelDetails>
                    <TextField
                      id="standard-basic"
                      // label={get(renderItem, 'text')}
                      style={{marginLeft: '20px'}}
                      onChange={handleEditAnswer.bind(this, renderItem)}
                      value={get(renderItem, 'answer.0.valueString', '')}
                      fullWidth
                    />
                  </ExpansionPanelDetails>
                  <ExpansionPanelActions>
                    <Button className="stringAcceptButton" startIcon={<CheckIcon />} onClick={acceptItem.bind(this, renderItem)} >Accept</Button>
                    <Button className="stringClearButton" startIcon={<ClearIcon />} onClick={clearField.bind(this, renderItem)} >Clear</Button>
                  </ExpansionPanelActions>         
                </StyledExpansionPanel>)                     
                break;                      

              default:
                // questionPanels.push(<StyledExpansionPanel className={{root: "MuiExpansionPanel"}} expanded={expandedPanels ? true : (expandedPanel === get(renderItem, 'linkId'))} onClick={calculateLinkIdPath.bind(this, renderItem)} onChange={handleChange.bind(this, (get(renderItem, 'linkId')))} key={'expansionPanel-topLevel-' + renderItemIndex}>
                questionPanels.push(<StyledExpansionPanel className="MuiExpansionPanel" expanded={expandedPanels ? true : (expandedPanel === get(renderItem, 'linkId'))} onClick={calculateLinkIdPath.bind(this, renderItem)} onChange={handleChange.bind(this, (get(renderItem, 'linkId')))} key={'expansionPanel-topLevel-' + renderItemIndex}>
                  {linkIdElement}
                  <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} aria-controls={'expansionPanel-topLevel-' + renderItemIndex + "-content"} id={'expansionPanel-topLevel-' + renderItemIndex + "-header"} style={styles.summary}  >
                    <Typography>
                      <h4 className={barcodeClassname} style={{margin: '0px', fontWeight: 200}}>{get(renderItem, 'linkId')}</h4><p style={{margin: '0px'}}>{get(renderItem, 'text')}</p>
                    </Typography>
                  </ExpansionPanelSummary>            
                  <ExpansionPanelDetails>
                    <TextField
                      id="standard-basic"
                      // label={get(renderItem, 'text')}
                      style={{marginLeft: '20px'}}
                      onChange={handleEditAnswer.bind(this, renderItem)}
                      value={get(renderItem, 'answer.0.valueString', '')}
                      fullWidth
                    />
                  </ExpansionPanelDetails>
                  <ExpansionPanelActions>
                    <Button className="defaultAcceptButton" startIcon={<CheckIcon />} onClick={acceptItem.bind(this, renderItem)} >Accept</Button>
                    <Button className="defaultClearButton" startIcon={<ClearIcon />} onClick={clearField.bind(this, renderItem)} >Clear</Button>
                  </ExpansionPanelActions>         
                </StyledExpansionPanel>)       
              break;
            }          
          } 
          
          if (Array.isArray(renderItem.item)){

            // no answers options available, so assume we have section headers
            renderItem.item.forEach(function(question, questionIndex){
              console.debug('SurveyExpansionPanels.renderItem.question', question);
              
                answerChoices = parseQuestion(renderItemIndex, questionIndex);

                let questionExplanation = "";
                if(Array.isArray(renderItem.answer)){
                  renderItem.answer.forEach(function(answer){
                    if(get(answer, 'valueString')){
                      questionExplanation = get(answer, 'valueString');
                    }
                  });
                }

                // questionPanels.push(<StyledExpansionPanel classes={{ root: 'MuiExpansionPanel'}} className={{root: "MuiExpansionPanel"}} expanded={expandedPanels ? true : (expandedPanel === get(renderItem, 'linkId'))} onClick={calculateLinkIdPath.bind(this, renderItem)} onChange={handleChange.bind(this, (get(renderItem, 'linkId')))} style={styles.expansionPanel} key={'expansionPanel-question-' + renderItemIndex + '-' + questionIndex}>
                questionPanels.push(<StyledExpansionPanel className="MuiExpansionPanel" expanded={expandedPanels ? true : (expandedPanel === get(renderItem, 'linkId'))} onClick={calculateLinkIdPath.bind(this, renderItem)} onChange={handleChange.bind(this, (get(renderItem, 'linkId')))} style={styles.expansionPanel} key={'expansionPanel-question-' + renderItemIndex + '-' + questionIndex}>
                  <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} aria-controls={'expansionPanel-question-' + renderItemIndex + '-' + questionIndex + '-content'} id={'expansionPanel-question-' + renderItemIndex + '-' + questionIndex + '-header'} style={styles.summary}  >
                    <Typography>
                      <h4 className={barcodeClassname} style={{margin: '0px', fontWeight: 200}}>{get(renderItem, 'linkId')}</h4><p style={{margin: '0px'}}>{get(renderItem, 'text')}</p>
                    </Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails>
                    <TextField
                      id="standard-choice"
                      // label={get(renderItem, 'text')}
                      style={{marginLeft: '20px'}}
                      onChange={handleEditAnswer.bind(this, renderItem)}
                      value={get(renderItem, 'answer.0.valueString', '')}
                      fullWidth
                    />
                  </ExpansionPanelDetails>
                  <ExpansionPanelDetails className="measure-details" style={{display: 'block'}}>
                    <List>
                      { answerChoices }
                    </List>
                    <DynamicSpacer />
                    <Box className="explainability" sx={{bgcolor: '#eeeeee', width: '100%'  }}>
                      <CardContent>
                        <TextField
                          id="standard-basic"
                          label={"Explanation for item " + get(renderItem, 'linkId')}
                          sx={{marginLeft: '20px'}}
                          value={questionExplanation}
                          multiline={true}
                          fullWidth
                        />  
                      </CardContent> 
                    </Box>

                  </ExpansionPanelDetails>
                </StyledExpansionPanel>)  
            })
          }    
        }            
      });  
    }  
  }  


  return (
    <div id={ get(this, 'props.id', '')} className="questionnaireDetail">
      <div id='SurveyExpansionPanels'>
        { questionPanels }
      </div>
    </div>
  );
}

SurveyExpansionPanels.propTypes = {
  selectedQuestionnaire: PropTypes.object,
  selectedQuestionnaireId: PropTypes.string,
  selectedQuestionnaireResponse: PropTypes.object,
  selectedQuestionnaireResponseId: PropTypes.string,
  sortableItems: PropTypes.array,
  autoExpand: PropTypes.bool
};

SurveyExpansionPanels.defaultProps = {
  selectedQuestionnaire: null,
  selectedQuestionnaireResponse: responseTemplate,
  autoExpand: null
}

export default SurveyExpansionPanels;
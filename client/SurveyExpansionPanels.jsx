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

import { get, has, uniq, compact, cloneDeep, inRange } from 'lodash';
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

let defaultQuestionnaire = {
  "resourceType" : "Questionnaire"
};

// icons
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// import { Icon } from 'react-icons-kit'
import { ic_reorder } from 'react-icons-kit/md/ic_reorder'


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

// ====================================================================================================================
// Session Variables  

Session.setDefault('questionnaireUpsert', false);
Session.setDefault('selectedQuestionnaire', null);
Session.setDefault('sortableItems', []);
// Session.setDefault('draftResponse', responseTemplate );


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

  let [draftResponse, setDraftResponse] = useState(responseTemplate);
  let [checkboxChecked, setCheckbox] = useState({item: [{answer: []}, {answer: []}, {answer: []}, {answer: []}, {answer: []}]});
  let [orderOfItems, setOrderOfItems] = useState([]);

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
    // console.log('draftResponse[lastUpdated]', draftResponse);

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



  let questionPanels = [];

  function handleToggleItem(selectedLinkId, selectedValueCoding){
    console.log('----------------------------------------------------------------------------')
    console.log('SurveyExpansionPanels.handleToggleItem', selectedLinkId, selectedValueCoding)
    console.log('SurveyExpansionPanels.handleToggleItem.draftResponse', draftResponse)

    let newResponse = cloneDeep(draftResponse);
    
    
    if(Array.isArray(newResponse.item)){
      newResponse.item.forEach(function(sectionItem, sectionItemIndex){       
        
        console.log('sectionItem.linkId', get(sectionItem, 'linkId'))
        let newSectionAnswer = [];
        
        if(get(sectionItem, 'linkId') === selectedLinkId){
          console.log('match!')
          newSectionAnswer.push({
            valueCoding: selectedValueCoding
          })
          console.log('newSectionAnswer!', newSectionAnswer);

          let newSectionItem = newResponse.item[sectionItemIndex];
          delete newSectionItem.answer;
          newSectionItem.answer = newSectionAnswer;
          console.log('newSectionItem!', newSectionItem);

          newResponse.item[sectionItemIndex] = newSectionItem;
          console.log('newResponse!', newResponse)
          Session.set('draftQuestionnaireResponse', newResponse)

        } else if(Array.isArray(sectionItem.item)){
          sectionItem.item.forEach(function(question, questionIndex){

            let newQuestionAnswer = [];
            if(get(question, 'linkId') === selectedLinkId){
              console.log('question match!')
              newQuestionAnswer.push({
                valueCoding: selectedValueCoding
              })
              newResponse.item[sectionItemIndex].item[questionIndex].answer = newQuestionAnswer;
            }
          })            
        }        
        
      })

      console.log('SurveyExpansionPanels.handleToggleItem.newResponse', newResponse)
      Session.set('lastUpdated', new Date())
      setDraftResponse(newResponse) 
    }    
  }

  function handleToggleCheckbox(renderItemIndex, event, newValue){
    console.log('handleToggleCheckbox', renderItemIndex, event, newValue)

    console.log('checkboxChecked', checkboxChecked);
    console.log('!checkboxChecked[renderItemIndex]', !checkboxChecked[renderItemIndex]);

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
    console.log('newCheckboxObject', newCheckboxObject);

    setCheckbox(newCheckboxObject);
  }

  function generateAnswerOptions(answerChoices, currentQuestion){
    // console.log('----------------------------------------------------------------------------')
    // console.log('SurveyExpansionPanels.generateAnswerOptions')

    if(Array.isArray(currentQuestion.answerOption)){

      // does this section element have answers?            
      if(currentQuestion.answerOption.length > -1){
        // for each answer we render, we are going to need to figure out 
        // if the answer has been selected
        currentQuestion.answerOption.forEach(function(option, index){
          // console.log('SurveyExpansionPanels.answerOptions.option', option)

          let optionIsChecked = false;

          if(get(currentQuestion, 'answer[0].valueCoding.code') === get(option, 'valueCoding.code')){
            optionIsChecked = true;
          }       

          let answers = get(currentQuestion, 'answer', []);
          let explanationElements = [];
          if(Array.isArray(answers)){
            answers.forEach(function(answer){
              if(get(answer, 'valueCoding.code') === get(option, 'valueCoding.code')){
                // explanationElements.push(<Typography>{get(answer, 'valueCoding.display')}</Typography>)
                explanationElements.push(<DynamicSpacer />)
                explanationElements.push(<Box sx={{bgcolor: 'aliceblue', width: '100%'  }}>
                  <CardContent>
                    { get(option, 'valueCoding.display') }
                  </CardContent>
                </Box>)
              }
            })
          }

          answerChoices.push(<ListItem style={{paddingLeft: '120px'}} key={'answer-' + index}>
            <ListItemIcon>
              <Checkbox name="checkedDateRangeEnabled" checked={optionIsChecked} onChange={handleToggleItem.bind(this, get(currentQuestion, 'linkId'), get(option, 'valueCoding'))} />
            </ListItemIcon>
            <ListItemText>
              { get(option, 'valueCoding.display') }
              { explanationElements }                
            </ListItemText>
          </ListItem>);
        })
      }

    } 
  }

  // we're going to get a question, along with the indices for where it exists in the hierarcy, up to two levels deep
  function parseQuestion(sectionIndex, questionIndex){
    console.log('Parsing questions', sectionIndex, questionIndex)
    let answerChoices = [];  

    let queryPluckString = "";
                    
    if(questionIndex > -1){
      queryPluckString = 'item[' + sectionIndex + '].item[' + questionIndex + ']';
    } else {
      queryPluckString = 'item[' + sectionIndex + ']';
    }

    console.log('queryPluckString', queryPluckString)
    let currentQuestion = get(currentResponse, queryPluckString)
    console.log('currentQuestion', currentQuestion)

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
    console.log('clearField', renderItem)

  }
  function parseMultipleChoice(renderItem){
    console.log('parseMultipleChoice')

    console.log('textNormalForm', textNormalForm);
    console.log('renderItem', renderItem);
    console.log('renderItem.answer.0.valueString', get(renderItem, 'answer.0.valueString'));



    
  }


  // Forms with Functional React Components
  // Pros:  React internal state works really well
  // Cons:  FHIR QuestionnaireResponses store answers in arrays
  // Solution:  Helper methods (eventually)
  // Kludge: In the meantime, we have this gnarly thing to deal with

  // do we have question items to display in expansion panels
  console.log('===========================================================================================')
  console.log('SurveyExpansionPanels.selectedQuestionnaire', selectedQuestionnaire)
  console.log('SurveyExpansionPanels.selectedQuestionnaireResponse', selectedQuestionnaireResponse)
  console.log('SurveyExpansionPanels.draftResponse (pre main render)', draftResponse)


  let currentResponse = draftResponse;
  if(selectedQuestionnaireResponse){
    currentResponse = selectedQuestionnaireResponse;
  }

  if(currentResponse){
    if(Array.isArray(currentResponse.item)){



      currentResponse.item.forEach(function(renderItem, renderItemIndex){
        if(renderItem){
          // console.log('renderItem', renderItem)
  
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
    
            questionPanels.push(<StyledExpansionPanel className={classes.MuiExpansionPanel} expanded={expandedPanels} classes={{ root: 'ExpansionPanel' }} key={'expansionPanel-topLevel-' + renderItemIndex}>
              {linkIdElement}
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} aria-controls={'expansionPanel-topLevel-' + renderItemIndex + "-content"} id={'expansionPanel-topLevel-' + renderItemIndex + "-header"}  style={styles.summary} >
                <Typography className="measure-description" style={styles.description} noWrap={noWrap}>
                  {get(renderItem, 'text')}
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className="measure-details" style={{display: 'block'}}>
                <List>
                  { answerChoices }
                </List>
                <DynamicSpacer />
                {/* { get(renderItem, 'answer.0.valueString') ? <Typography>{get(renderItem, 'answer.0.valueString')}</Typography> : null } */}
                <DynamicSpacer />
                <Box sx={{bgcolor: '#eeeeee', width: '100%'  }}>
                  <CardContent>
                    <TextField
                      id="standard-basic"
                      label={get(renderItem, 'linkId')}
                      sx={{marginLeft: '20px'}}
                      value={get(renderItem, 'answer.0.valueString', '')}
                      multiline={true}
                      fullWidth
                    />   
                  </CardContent>
                </Box>
              </ExpansionPanelDetails>
              <ExpansionPanelActions>
              <Button startIcon={<FormatListBulletedIcon />}style={{float: 'right'}} onClick={parseMultipleChoice.bind(this, renderItem)}>Parse Multiple Choice</Button>
                <Button startIcon={<CheckIcon />} >Accept</Button>
                <Button startIcon={<ClearIcon />} onClick={clearField.bind(this, renderItem)} >Clear</Button>
              </ExpansionPanelActions>         
            </StyledExpansionPanel>)   
    
    

          } else {
            // section titles
            console.log('SurveyExpansionPanels.sectionTitle', get(renderItem, 'text'))
            
            switch (get(renderItem, 'type')) {
              case "date":
                questionPanels.push(<StyledExpansionPanel className={classes.MuiExpansionPanel} expanded={expandedPanels} key={'expansionPanel-topLevel-' + renderItemIndex}>
                  {linkIdElement}
                  <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} aria-controls={'expansionPanel-topLevel-' + renderItemIndex + "-content"} id={'expansionPanel-topLevel-' + renderItemIndex + "-header"} style={styles.summary}  >
                    <TextField
                      id="standard-basic"
                      label={get(renderItem, 'text')}
                      style={{marginLeft: '20px'}}
                      value={get(renderItem, 'answer.0.valueString', new Date())}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      type="date"
                      fullWidth
                    />
                  </ExpansionPanelSummary>   
                  <ExpansionPanelActions>
                  <Button startIcon={<CheckIcon />} >Accept</Button>
                    <Button startIcon={<ClearIcon />} >Clear</Button>
                  </ExpansionPanelActions>                  
                </StyledExpansionPanel>)                     
                break; 
              case "string":
                questionPanels.push(<StyledExpansionPanel className={classes.MuiExpansionPanel} expanded={expandedPanels} key={'expansionPanel-topLevel-' + renderItemIndex}>
                  {linkIdElement}
                  <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} aria-controls={'expansionPanel-topLevel-' + renderItemIndex + "-content"} id={'expansionPanel-topLevel-' + renderItemIndex + "-header"} style={styles.summary}  >
                    <TextField
                      id="standard-basic"
                      label={get(renderItem, 'text')}
                      style={{marginLeft: '20px'}}
                      value={get(renderItem, 'answer.0.valueString', '')}
                      fullWidth
                    />
                  </ExpansionPanelSummary>   
                  <ExpansionPanelActions>
                  <Button startIcon={<CheckIcon />} >Accept</Button>
                    <Button startIcon={<ClearIcon />} >Clear</Button>
                  </ExpansionPanelActions>         
                </StyledExpansionPanel>)                     
                break;          
              default:
                questionPanels.push(<StyledExpansionPanel className={classes.MuiExpansionPanel} expanded={expandedPanels} key={'expansionPanel-topLevel-' + renderItemIndex}>
                  {linkIdElement}
                  <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} aria-controls={'expansionPanel-topLevel-' + renderItemIndex + "-content"} id={'expansionPanel-topLevel-' + renderItemIndex + "-header"} style={styles.summary}  >
                    <TextField
                      id="standard-basic"
                      label={get(renderItem, 'text')}
                      style={{marginLeft: '20px'}}
                      value={get(renderItem, 'answer.0.valueString', '')}
                      fullWidth
                    />
                  </ExpansionPanelSummary>            
                  <ExpansionPanelActions>
                    <Button startIcon={<CheckIcon />} >Accept</Button>
                    <Button startIcon={<ClearIcon />} >Clear</Button>
                  </ExpansionPanelActions>         
                </StyledExpansionPanel>)       
              break;
            }          
          } 
          
          if (Array.isArray(renderItem.item)){

            // no answers options available, so assume we have section headers
            renderItem.item.forEach(function(question, questionIndex){
              console.log('SurveyExpansionPanels.renderItem.question', question);
              
                answerChoices = parseQuestion(renderItemIndex, questionIndex);
                questionPanels.push(<StyledExpansionPanel classes={{ root: 'MuiExpansionPanel'}} className={{root: "MuiExpansionPanel"}} expanded={expandedPanels} style={styles.expansionPanel} key={'expansionPanel-question-' + renderItemIndex + '-' + questionIndex}>
                  <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} aria-controls={'expansionPanel-question-' + renderItemIndex + '-' + questionIndex + '-content'} id={'expansionPanel-question-' + renderItemIndex + '-' + questionIndex + '-header'} style={styles.summary}  >
                    {/* <Typography className="measure-identifier" style={styles.identifier}>{get(question, 'linkId', questionIndex)}</Typography> */}
                    <Typography className="measure-description" style={styles.description} noWrap={noWrap}>
                      {get(question, 'text')}
                    </Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails className="measure-details" style={{display: 'block'}}>
                    <List>
                      { answerChoices }
                    </List>
                    <DynamicSpacer />
                    <Box sx={{bgcolor: '#eeeeee', width: '100%'  }}>
                      <CardContent>
                        <TextField
                          id="standard-basic"
                          label={get(renderItem, 'linkId')}
                          sx={{marginLeft: '20px'}}
                          value={get(renderItem, 'answer.0.valueString', '')}
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
  selectedQuestionnaireResponse: null,
  autoExpand: null
}

export default SurveyExpansionPanels;
import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Container from '@material-ui/core/Container';

import { get } from 'lodash';
import { Meteor } from 'meteor/meteor';

import { PageCanvas, StyledCard } from 'material-fhir-ui';

import { CommunicationRequestsTable, TasksTable, ListsTable } from 'meteor/clinical:hl7-fhir-data-infrastructure';

import { useTracker } from './Tracker';

function DynamicSpacer(props){
  return <br className="dynamicSpacer" style={{height: '40px'}}/>;
}

//==============================================================================================
// THEMING

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  button: {
    margin: theme.spacing(1)
  }
}));

//==============================================================================================
// MAIN COMPONENT


function StructuredDataCapturePage(props){

  const classes = useStyles();

  let communicationsCursor;
  let communications = [];
  let communicationsCount = 0;

  communications = useTracker(function(){
    return Communications.find();
  }, [])
  if(communicationsCursor){
    communications = communicationsCursor.fetch();
    communicationsCount = communicationsCursor.count()
  }

  let tasksCursor;
  let tasks = [];
  let tasksCount = 0;

  tasksCursor = useTracker(function(){
    return Tasks.find();
  }, [])
  if(tasksCursor){
    tasks = tasksCursor.fetch();
    tasksCount = tasksCursor.count()
  }

  let listsCursor;
  let lists = [];
  let listsCount = 0;

  listsCursor = useTracker(function(){
    return Lists.find();
  }, [])
  if(listsCursor){
    lists = listsCursor.fetch();
    listsCount = listsCursor.count()
  }



  
  let headerHeight = 84;
  if(get(Meteor, 'settings.public.defaults.prominantHeader')){
    headerHeight = 148;
  }  

  return (
    <PageCanvas id='StructuredDataCapturePage' headerHeight={headerHeight} >
      <Grid container spacing={3}>
        <Grid item md={6}>
          <StyledCard height="auto">
            <CardHeader 
              title="Inbound Communications" 
              style={{fontSize: '100%'}} />
            <CardContent style={{fontSize: '120%'}}>
              <CommunicationRequestsTable 
                communications={ communications }
                count={ communicationsCount }
              />
            </CardContent>
          </StyledCard>          

        </Grid>
        <Grid item md={6}>
          <StyledCard>
            <CardHeader 
              title="Lists" 
              style={{fontSize: '100%'}} />
            <CardContent style={{fontSize: '120%'}}>
              <ListsTable 
                tasks={ lists }
                count={ listsCount }
              />
            </CardContent>
          </StyledCard>      
          <DynamicSpacer />
          <StyledCard>
            <CardHeader 
              title="Tasks" 
              style={{fontSize: '100%'}} />
            <CardContent style={{fontSize: '120%'}}>
              <TasksTable 
                tasks={ tasks }
                count={ tasksCount }
              />
            </CardContent>
          </StyledCard>      


        </Grid>
      </Grid>
    </PageCanvas>
  );
}

export default StructuredDataCapturePage;
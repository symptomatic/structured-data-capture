
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

if(Meteor.isClient){
  Meteor.subscribe('Questionnaires');
  Meteor.subscribe('QuestionnaireResponses');
}


if(Meteor.isServer){
  Meteor.publish('Questionnaires', function(){
    return Questionnaires.find();
  });    
  Meteor.publish('QuestionnaireResponses', function(){
    return QuestionnaireResponses.find();
  });    
}


Meteor.methods({
  clearSubscriptionCursors: function(){
    Questionnaires.remove({});
    QuestionnaireResponses.remove({});
  },
  clearQuestoinnaireResponses: function(){
    QuestionnaireResponses.remove({});
  },
  clearCommunicationLogs: function(){
    Communications.remove({});
    CommunicationRequests.remove({});
  }
})
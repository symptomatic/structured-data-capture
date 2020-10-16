import { Meteor } from 'meteor/meteor';

import { get } from 'lodash';
import { ExplanationOfBenefits, Locations } from 'meteor/clinical:hl7-fhir-data-infrastructure';

import HungerVitalSignsQuestionnaireBundle from '../data/SDOHCC_Questionnaire_HungerVitalSign_1_Bundle';



GravityMethods = {
  initializeHungerVitalSignsQuestionnaire: function(){
    GravityMethods.ingestQuestionnaire(HungerVitalSignsQuestionnaireBundle);
  },
  ingestQuestionnaire: function(record){
    console.log("Ingesting questionnaire...", record);
    
    if(get(record, 'resourceType') === "Bundle"){
      if(Array.isArray(get(record, 'entry'))){
        record.entry.forEach(function(entry){
          if(get(entry, 'resource.resourceType') === "Questionnaire"){
            Questionnaires.upsert({id: get(entry, 'resource.id')}, {$set: get(entry, 'resource')}, {filter: false, validate: false});                            
          }
        });
      }

    } else if(get(record, 'resourceType') === "Questionnaire"){
      Questionnaires.upsert({id: get(record, 'id')}, {$set: record}, {filter: false, validate: false});                            
    }
  }
}

export default GravityMethods;
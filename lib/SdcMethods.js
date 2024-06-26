import { Meteor } from 'meteor/meteor';

import { get } from 'lodash';
import { ExplanationOfBenefits, Locations } from 'meteor/clinical:hl7-fhir-data-infrastructure';

import HungerVitalSignsQuestionnaireBundle from '../data/SDOHCC_Questionnaire_HungerVitalSign_1_Bundle';

import PrapreQuestionnaire from '../data/PRAPARE-Questionnaire';
import BasicQuestionnaire from '../data/Questionnaire-basic';
import Form85008Questionnaire from '../data/Questionnaire-FAA-8500-8.R4';
import MinimumDataSetQuestionnaire from '../data/Questionnaire-minimum-data-set';

import FasiQuestionnaire from '../data/Questionnaire-FASI-FA-1.1';
import HisHaQuestionnaire from '../data/Questionnaire-HIS-HA-2.00.0';
import HisHdQuestionnaire from '../data/Questionnaire-HIS-HD-2.00.0';
import IrfPaiIaQuestionnaire from '../data/Questionnaire-IRF-PAI-IA-3.0';
import LcdsLaQuestionnaire from '../data/Questionnaire-LCDS-LA-4.00';
import OasisDahQuestionnaire from '../data/Questionnaire-OASIS-DAH-D1-012020';

import Phq9Questionnaire from '../data/Questionnaire-PHQ9';

StructuredDataCapturedModule = {
  initializeFillbotQuestionnaires: function(){
    StructuredDataCapturedModule.ingestQuestionnaire(HungerVitalSignsQuestionnaireBundle);

    StructuredDataCapturedModule.ingestQuestionnaire(PrapreQuestionnaire);
    StructuredDataCapturedModule.ingestQuestionnaire(BasicQuestionnaire);
    StructuredDataCapturedModule.ingestQuestionnaire(Form85008Questionnaire);
    StructuredDataCapturedModule.ingestQuestionnaire(MinimumDataSetQuestionnaire);

    StructuredDataCapturedModule.ingestQuestionnaire(FasiQuestionnaire);
    StructuredDataCapturedModule.ingestQuestionnaire(HisHaQuestionnaire);
    StructuredDataCapturedModule.ingestQuestionnaire(HisHdQuestionnaire);
    StructuredDataCapturedModule.ingestQuestionnaire(IrfPaiIaQuestionnaire);
    StructuredDataCapturedModule.ingestQuestionnaire(LcdsLaQuestionnaire);
    StructuredDataCapturedModule.ingestQuestionnaire(OasisDahQuestionnaire);

    StructuredDataCapturedModule.ingestQuestionnaire(Phq9Questionnaire);
    
  },
  initializeHungerVitalSignsQuestionnaire: function(){
    StructuredDataCapturedModule.ingestQuestionnaire(HungerVitalSignsQuestionnaireBundle);
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

export default StructuredDataCapturedModule;
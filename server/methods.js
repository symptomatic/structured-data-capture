

import { Questionnaires } from 'meteor/clinical:hl7-fhir-data-infrastructure';
import StructuredDataCapturedModule from '../lib/SdcMethods';
import { get, has } from 'lodash';

Meteor.methods({
    initializeFillbotQuestionnaires: function(){
        console.log('Initializing fillbot questionnaires...');

        if(Questionnaires.find().count() === 0){
            StructuredDataCapturedModule.initializeFillbotQuestionnaires();
        }
    }
});
Package.describe({
  name: 'symptomatic:structured-data-capture',
  version: '0.5.0',
  summary: 'Structured Document Capture',
  git: 'https://github.com/symptomatic/gravity',
  documentation: 'README.md'
});


Package.onUse(function(api) {
  api.versionsFrom('1.4');
  
  api.use('meteor-base@1.4.0');
  api.use('ecmascript@0.13.0');
  api.use('react-meteor-data@0.2.15');
  api.use('session');
  api.use('mongo');
  api.use('http');
  api.use('ejson');
  api.use('random');
  api.use('fourseven:scss');

  api.addFiles('lib/Collections.js');

  
  api.use('symptomatic:data-management');
  api.use('symptomatic:fhir-uscore');
  api.use('symptomatic:vault-server');

  api.use('symptomatic:vault-server@6.2.1');
  api.use('clinical:hl7-fhir-data-infrastructure@6.5.3');
  api.imply('symptomatic:vault-server@6.2.1');

  api.mainModule('index.jsx', 'client');
});


Npm.depends({
  "react-sortable-hoc": "1.11.0"
});


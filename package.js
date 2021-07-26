Package.describe({
  name: 'symptomatic:structured-data-capture',
  version: '0.6.1',
  summary: 'Structured Document Capture',
  git: 'https://github.com/symptomatic/gravity',
  documentation: 'README.md'
});


Package.onUse(function(api) {
  api.versionsFrom('1.4');
  
  api.use('meteor-base@1.4.0');
  api.use('ecmascript@0.13.0');
  api.use('react-meteor-data@2.1.2');
  api.use('session');
  api.use('mongo');
  api.use('http');
  api.use('ejson');
  api.use('random');
  api.use('fourseven:scss');

  api.addFiles('lib/Collections.js');

  
  api.use('symptomatic:fhir-uscore');
  api.use('symptomatic:vault-server-freemium');
  api.use('clinical:hl7-fhir-data-infrastructure@6.14.14');

  // api.use('symptomatic:vault-server@6.2.1');
  // api.imply('symptomatic:vault-server@6.2.1');

  api.mainModule('index.jsx', 'client');
});


Npm.depends({
  "react-sortable-hoc": "1.11.0"
});


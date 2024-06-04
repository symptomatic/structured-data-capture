Package.describe({
  name: 'symptomatic:structured-data-capture',
  version: '0.6.4',
  summary: 'Structured Document Capture',
  git: 'https://github.com/symptomatic/gravity',
  documentation: 'README.md'
});


Package.onUse(function(api) {
  api.versionsFrom('1.4');
  
  api.use('meteor-base@1.4.0');
  api.use('ecmascript@0.16.0');
  api.use('react-meteor-data@2.4.0');
  api.use('session');
  api.use('mongo');
  api.use('http');
  api.use('ejson');
  api.use('random');
  api.use('fourseven:scss');

  api.addFiles('lib/Collections.js');

  api.addFiles('server/methods.js');
  
  api.use('clinical:uscore');
  api.use('clinical:vault-server');
  api.use('clinical:hl7-fhir-data-infrastructure');

  // api.use('symptomatic:vault-server@6.2.1');
  // api.imply('symptomatic:vault-server@6.2.1');

  api.mainModule('index.jsx', 'client');
});


Npm.depends({
  "react-sortable-hoc": "1.11.0",
  "@mui/icons-material": "5.15.13",
  "@mui/material": "5.15.13",
  "@emotion/styled": "11.11.0",
  "tree-walk": "0.4.0",
  "react-accessible-treeview": "2.9.0"
});


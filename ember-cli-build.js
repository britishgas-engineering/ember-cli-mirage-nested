/*jshint node:true*/
/* global require, module */
var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {

  var exclude = [],
    options = {};

  if (process.env.EMBER_ENV === 'production') {
   // exclude.push(defaults.project.pkg.name + '/routes/dev-only/mirage-seed-data/**/*');
   exclude.push(defaults.project.pkg.name + '/mirage/**/*');
  }

  options.funnel = {
   enabled: true,
   exclude: exclude
  }
  
  var app = new EmberAddon(defaults, options);

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  return app.toTree();

};

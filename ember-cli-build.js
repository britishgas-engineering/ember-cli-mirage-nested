'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function (defaults) {
  var exclude = [];

  if (process.env.EMBER_ENV === 'production') {
    // exclude.push(defaults.project.pkg.name + '/routes/dev-only/mirage-seed-data/**/*');
    exclude.push(defaults.project.pkg.name + '/mirage/**/*');
  }

  let app = new EmberAddon(defaults, {
    funnel: {
      exclude,
      enabled: true,
    },
    'ember-bootstrap': {
      bootstrapVersion: 3,
      importBootstrapCSS: false,
      importBootstrapFont: true,
    },
  });
  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  const { maybeEmbroider } = require('@embroider/test-setup');
  return maybeEmbroider(app, {
    skipBabel: [
      {
        package: 'qunit',
      },
    ],
  });
};

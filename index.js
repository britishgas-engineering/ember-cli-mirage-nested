/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-cli-mirage-nested',
  options: {},
  isDevelopingAddon: function () {
    return true;
  },
  included: function included(app) {
    // see: https://github.com/ember-cli/ember-cli/issues/3718
    if (typeof app.import !== 'function' && app.app) {
      app = app.app;
    }

    this.app = app;
    this.addonConfig = this.app.project.config(app.env)['ember-cli-mirage-nested'] || {};
    this._super.included.apply(this, arguments);
  },
  treeFor: function(name) {
    if (!this._shouldIncludeFiles()) {
      return;
    }

    return this._super.treeFor.apply(this, arguments);
  },
  _shouldIncludeFiles: function() {
    if (process.env.EMBER_CLI_FASTBOOT) { return false; }
    var environment = this.app.env;
    var enabledInProd = this.app.env === 'production' && this.addonConfig.enabled;
    var explicitExcludeFiles = this.addonConfig.excludeFilesFromBuild;
    if (enabledInProd && explicitExcludeFiles) {
      throw new Error('Mirage-nested was explicitly enabled in production, but its files were excluded ' +
                      'from the build. Please, use only ENV[\'ember-cli-mirage-nested\'].enabled in ' +
                      'production environment.');
    }
    return enabledInProd || (environment && environment !== 'production' && explicitExcludeFiles !== true);
  },
};

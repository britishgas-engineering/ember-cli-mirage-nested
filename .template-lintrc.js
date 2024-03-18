/* eslint-env node */
'use strict';

const warn = ['warn', { allow: ['*'] }];

module.exports = {
  extends: 'recommended',
  rules: {
    'no-action': warn,
    'simple-unless': warn,
    'no-yield-only': false,
    'no-implicit-this': warn,
    'no-triple-curlies': false,
    'style-concatenation': false,
    'no-forbidden-elements': false,
    'self-closing-void-elements': false,
    'no-link-to-positional-params': false,
    'no-curly-component-invocation': warn,
    'require-input-label': false,
    'no-invalid-interactive': {
      additionalInteractiveTags: ['nsx-address-selector', 'ns-cta']
    }
  }
};

# Ember-cli-mirage-nested

Extend your Mirage models from the bg-model in this addon, for example:

`````
import Model from 'ember-cli-mirage-nested/mirage/bg-model';

export default Model.extend({
  childrenAssociations: ['children'],
  allowChangeNbAssociations: ['children'],
  children: hasMany('grand-child', {inverse: 'parent'}),
  parent: belongsTo('parent')
});
`````

See demo on https://britishgas-engineering.github.io/ember-cli-mirage-nested

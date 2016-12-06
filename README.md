# Ember-cli-mirage-nested

Define your Mirage scenario with nested syntax such as:

`````
server.create('parent').hasOne('child').hasOne('grandChild');
`````

# Usage

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

# Demo

https://britishgas-engineering.github.io/ember-cli-mirage-nested

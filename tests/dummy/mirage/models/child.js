import Model from 'ember-cli-mirage-nested/mirage/bg-model';
import { hasMany, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  childrenAssociations: ['children'],
  allowChangeNbAssociations: ['children'],
  children: hasMany('grand-child', {inverse: 'parent'}),
  parent: belongsTo('parent'),
  default() {
    this.update('title', 'The title attribute of this model is set on init in the "default" hook of the model.');
    this.hasMulti('children', 2);
  },
  flags: [{
    name: 'title',
    options: [
      'The title attribute of this model is set on init in the "default" hook of the model.',
      'Also, this model has two children by default.'
    ]
  }],
});

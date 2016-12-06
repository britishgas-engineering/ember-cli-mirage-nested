import Model from 'ember-cli-mirage-nested/mirage/bg-model';
import { hasMany, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  childrenAssociations: ['children'],
  allowChangeNbAssociations: ['children'],
  children: hasMany('grand-child', {inverse: 'parent'}),
  parent: belongsTo('parent')
});

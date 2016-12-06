import Model from 'ember-cli-mirage-nested/mirage/bg-model';
import { hasMany } from 'ember-cli-mirage';

export default Model.extend({
  childrenAssociations: ['children'],
  allowChangeNbAssociations: ['children'],
  children: hasMany('child', {inverse: 'parent'})
});

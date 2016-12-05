import Model from 'ember-cli-mirage-nested/mirage/model';
import { hasMany, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  children: hasMany('grand-child'),
  parent: belongsTo('parent')
});

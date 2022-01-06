import Model, { hasMany, belongsTo, attr } from '@ember-data/model';

export default class ChildModel extends Model {
  @hasMany('grand-child') children;
  @belongsTo('parent') parent;
  @attr('string') title;
}

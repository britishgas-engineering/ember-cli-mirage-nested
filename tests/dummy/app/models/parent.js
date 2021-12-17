import Model, { hasMany } from '@ember-data/model';

export default class ParentModel extends Model {
  @hasMany('child') children;
}

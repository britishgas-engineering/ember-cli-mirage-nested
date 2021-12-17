import Model, { belongsTo } from '@ember-data/model';

export default class GrandChildModel extends Model {
  @belongsTo('child') parent;
}

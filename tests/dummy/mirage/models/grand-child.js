import Model from 'ember-cli-mirage-nested/mirage/bg-model';
import { belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  parent: belongsTo('child')
});
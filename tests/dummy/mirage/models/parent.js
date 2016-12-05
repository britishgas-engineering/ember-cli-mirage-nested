import Model from 'ember-cli-mirage-nested/mirage/model';
import { hasMany } from 'ember-cli-mirage';

export default Model.extend({
  children: hasMany('child')
});

import Model from 'ember-data/model';
import DS from 'ember-data';

export default Model.extend({
  children: DS.hasMany('child')
});

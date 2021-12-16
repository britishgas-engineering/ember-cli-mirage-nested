import Ember from 'ember';
const { computed, Component } = Ember;
import { decamelize } from '@ember/string';

export default Component.extend({
  model: null,
  propertyName: null,
  propertyNameDisplay: computed('propertyName', function () {
    return decamelize(this.propertyName).split('_').join(' ');
  }),
  propertyVal: computed('model', 'propertyName', function () {
    // https://spin.atomicobject.com/2015/08/03/ember-computed-properties/
    let model = this.model,
      propertyName = this.propertyName;
    return !model
      ? 'loading..'
      : Ember.Object.extend({
          value: computed.alias(`model.${propertyName}`),
        }).create({ model });
  }),
  dynamicPropertyVal: computed.alias('propertyVal.value'),
  result: computed('dynamicPropertyVal.{isFulfilled,isRejected}', function () {
    let val = this.dynamicPropertyVal;
    if (!val) {
      return val;
    }
    if (val.then) {
      if (val.isFulfilled) {
        return true;
      } else if (val.isRejected) {
        return false;
      } else {
        return 'loading..';
      }
    } else {
      return val;
    }
  }),
  reason: computed('dynamicPropertyVal.{isFulfilled,reason}', function () {
    let val = this.dynamicPropertyVal;
    if (!val) {
      return val;
    }
    if (val.isFulfilled) {
      return {};
    } else {
      let hash = Ember.copy(val.reason, true);
      hash = (!hash || hash.length) ? hash : [hash];// eslint-disable-line
      return hash
        ? hash.map((reas) => {
            return JSON.stringify(reas);
          })
        : null;
    }
  }),
  modelName: computed('model', function () {
    let model = this.model;
    if (model) {
      return model.constructor.modelName;
    } else {
      return '';
    }
  }),
});

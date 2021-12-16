import Ember from 'ember';
const { computed, Component } = Ember;

export default Component.extend({
  object: {},
  key: null,
  item: computed('object', 'key', function () {
    // console.log('item', this.get('object'), this.get('key'), this.get('object')[this.get('key')]);
    Ember.run.next(this, () => {
      this.propertyDidChange('item');
    }); //https://github.com/emberjs/ember.js/issues/11880
    let object = this.object,
      keys = this.key.split('.');
    keys.forEach((key) => {
      object = object[key];
    });
    return object;
  }),
});

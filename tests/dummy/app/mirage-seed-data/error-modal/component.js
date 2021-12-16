import Ember from 'ember';
const { Component } = Ember;

export default Component.extend({
  actions: {
    close() {
      if (this.attrs.close) {
        return this.attrs.close();
      } else {
        return false;
      }
    },
  },
});

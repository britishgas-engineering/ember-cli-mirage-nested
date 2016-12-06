import Ember from 'ember';

export default Ember.Route.extend({
  // notifier: Ember.inject.service(),
  model() {
    return this.store.findAll('parent').then((parents) => {
      return {
        mirage: server.schema.parents.all().models[0],//eslint-disable-line
        ember: parents.get('firstObject')
      };
    });
  },
  actions: {
    refresh() {
      this.store.unloadAll();
      return this.refresh();
    },
    sendError(error) {
      this.controller.set('error', error);
    }
  }
});

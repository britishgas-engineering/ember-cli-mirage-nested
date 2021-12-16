import Ember from 'ember';

export default Ember.Route.extend({
  store: Ember.inject.service(),
  model() {
    return this.store.findAll('parent').then((parents) => {
      return {
        mirage: server.schema.parents.all().models[0],//eslint-disable-line
        ember: parents.get('firstObject'),
      };
    });
  },
  _writeSentence() {
    let children = server.schema.children.all().models,
      sent = ['let parent, children, grandChildren;'];
    sent.pushObject(["parent = server.create('parent');"]);
    sent.pushObject(
      `children = parent.hasMulti('children', ${children.length});`
    );
    sent.pushObject('children.forEach((child) => {');
    sent.pushObject('child.');
    sent.pushObject('});');
    this.controller.set('sentences', sent);
  },
  actions: {
    refresh() {
      this.store.unloadAll();
      this._writeSentence();
      return this.refresh();
    },
    sendError(error) {
      this.controller.set('error', error);
    },
  },
});

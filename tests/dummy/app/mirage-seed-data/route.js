import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class MirageSeedDataRoute extends Route {
  @service store;

  model() {
    return this.store.findAll('parent').then((parents) => {
      return {
        // eslint-disable-next-line no-undef
        mirage: server.schema.parents.all().models[0],
        ember: parents.get('firstObject')
      };
    });
  }

  #writeSentence = () => {
    // eslint-disable-next-line no-undef
    let children = server.schema.children.all().models,
      sent = ['let parent, children, grandChildren;'];
    sent.pushObject(["parent = server.create('parent');"]);
    sent.pushObject(
      `children = parent.hasMulti('children', ${children.length});`
    );
    sent.pushObject('children.forEach((child) => {');
    sent.pushObject('child.');
    sent.pushObject('});');
    // eslint-disable-next-line ember/no-controller-access-in-routes
    this.controller.set('sentences', sent);
  };

  @action refreshModel() {
    this.store.unloadAll();
    this.#writeSentence();
    this.refresh();
  }

  @action sendError(error) {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    this.controller.set('error', error);
  }
}

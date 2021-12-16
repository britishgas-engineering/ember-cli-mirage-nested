import { readOnly } from '@ember/object/computed';
import EmberObject, { computed } from '@ember/object';
import { on } from '@ember/object/evented';
import Component from '@ember/component';

export default Component.extend({
  initializeCollapsed: on('init', function () {
    // otherwise it would be shared between different components
    this.set('collapsed', EmberObject.create({}));
    let model = this.model;
    model.childrenAssociations.forEach((relName) => {
      let rel = model[relName],
        belongsTo = !rel || !rel.models,
        model2 = belongsTo ? rel : rel.models[0];
      if (model2 && model2.collapse) {
        this.collapsed.set(relName, true);
      }
    });
  }),
  model: null,
  parentModel: null,
  relName: null,
  collapsed: EmberObject.create({}),
  level: 0,
  levelNew: computed('level', function () {
    return this.level + 1;
  }),
  flags: readOnly('model.forGUI.flags'),
  error: null,
  childrenAssociations: computed('model.childrenAssociations', function () {
    let model = this.model;
    if (model) {
      return model.childrenAssociations.map((relName) => {
        let rel = model[relName],
          belongsTo = !rel || !rel.models,
          hasMany = !belongsTo;
        return {
          name: relName,
          count: belongsTo ? (rel ? 1 : 0) : rel.models.length,//eslint-disable-line
          models: belongsTo ? [rel] : rel.models,
          /*collapseName: belongsTo ? (rel ? relName + rel.id : null) : rel.models.map((rel) => {//eslint-disable-line
            return relName + rel.id;
          })*/
          collapseName: relName,
          canAdd:
            (hasMany || !rel) &&
            model.forGUI.allowChangeNbAssociations &&
            model.forGUI.allowChangeNbAssociations.includes(relName),
          canDelete:
            model.forGUI.allowChangeNbAssociations &&
            model.forGUI.allowChangeNbAssociations.includes(relName),
        };
      });
    } else {
      return [];
    }
  }),
  actions: {
    toggleCollapse(relName) {
      let collapsed = this.collapsed;
      collapsed.toggleProperty(relName);
      return true; //for double click
    },
    addRelationship(relName) {
      // console.log('addRelationship', relName, this.get('model'));
      this.model.addRelationship(relName);
      this.notifyPropertyChange('childrenAssociations');
      this.send('refreshRoute');
      return false;
    },
    deleteRelationship(relName, model, parentModel) {
      // console.log('deleteRelationship', relName, model, parentModel);
      parentModel.deleteRelationship(relName, model);
      this.attrs.parentAssociationsHaveChanged();
      return false;
    },
    associationsHaveChanged(propagate) {
      this.notifyPropertyChange('childrenAssociations');
      if (propagate) {
        this.attrs.parentAssociationsHaveChanged();
      } else {
        this.send('refreshRoute');
      }
    },
    changeFlag(flag, option) {
      let model = this.model;
      try {
        if (model[flag.method]) {
          model[flag.method](option);
        } else {
          model.update(flag.name, option);
        }
      } catch (err) {
        this.send('sendError', err);
      }
      this.notifyPropertyChange('childrenAssociations');
      this.attrs.parentAssociationsHaveChanged(true); //when changing servicesProductHolding hasProduct for example
      this.send('refreshRoute');
    },
    refreshRoute() {
      return this.attrs.refreshRoute();
    },
    sendError(err) {
      return this.attrs.sendError(err);
    },
  },
});

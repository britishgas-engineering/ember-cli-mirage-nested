import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import podNames from 'ember-component-css/pod-names';

export default class DebugModelComponent extends Component {
  get styleNamespace() {
    return podNames['mirage-seed-data/debug-model'];
  }

  @tracked level = 0;
  @tracked collapsed = {};

  constructor(owner, args) {
    super(owner, args);

    const model = this.args.model;

    model.childrenAssociations.forEach((relName) => {
      const rel = model[relName];
      const belongsTo = !rel || !rel.models;
      const model2 = belongsTo ? rel : rel.models[0];

      if (model2 && model2.collapse) {
        this.collapsed[relName] = true;
      }
    });
  }

  get levelNew() {
    return this.level + 1;
  }

  get flags() {
    return this.args.model.forGUI.flags;
  }

  get childrenAssociations() {
    const model = this.args.model;

    if (model) {
      return model.childrenAssociations.map((relName) => {
        let rel = model[relName],
          belongsTo = !rel || !rel.models,
          hasMany = !belongsTo;
        return {
          name: relName,
          count: belongsTo ? (rel ? 1 : 0) : rel.models.length,
          models: belongsTo ? [rel] : rel.models,
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
  }

  @action toggleCollapse(relName) {
    const newRelName = {};
    newRelName[relName] = !this.collapsed[relName];
    this.collapsed = { ...this.collapsed, ...newRelName };
  }

  @action addRelationship(relName) {
    this.args.model.addRelationship(relName);
    this.refreshRoute();
  }

  @action deleteRelationship(relName, model, parentModel) {
    parentModel.deleteRelationship(relName, model);
    this.args.parentAssociationsHaveChanged();
  }

  @action associationsHaveChanged(propagate) {
    if (propagate) {
      this.args.parentAssociationsHaveChanged();
    } else {
      this.refreshRoute();
    }
  }

  @action changeFlag(flag, option) {
    let model = this.args.model;
    try {
      if (model[flag.method]) {
        model[flag.method](option);
      } else {
        model.update(flag.name, option);
      }
    } catch (err) {
      this.send('sendError', err);
    }
    this.args.parentAssociationsHaveChanged(true);
    this.refreshRoute();
  }

  @action refreshRoute() {
    this.args.refreshRoute();
  }

  @action sendError(err) {
    this.args.sendError(err);
  }
}

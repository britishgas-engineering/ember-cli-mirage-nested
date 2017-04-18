import { Model } from 'ember-cli-mirage';
import { toCollectionName } from 'ember-cli-mirage/utils/normalize-name';
import assert from 'ember-cli-mirage/assert';

export default Model.extend({
  // the associations in this list will be destroyed in beforeDestroy
  // TODO: define cleaner hasOne / belongsToMany relationships
  childrenAssociations: [],
  // the associations for which you can add / remove on the GUI
  allowChangeNbAssociations: [],
  // the flags to display on the GUI
  flags: [],
  default() {
    // override in model to setup when instantiated
  },

  updateAttrs(hash) {
    this.update(hash);
    // https://github.com/samselikoff/ember-cli-mirage/issues/719
    return this;
  },

  typeOf(relName) {
    let relNames = relName.pluralize();
    return this[relNames] ? 'hasMany' : 'belongsTo';
  },

  _beforeDestroy() {
    this.associationKeys.forEach((relName) => {
      if (this.childrenAssociations.indexOf(relName) > -1) {
        this.hasNo(relName);
      }
    });
  },
  //dontSaveAssociations: [],
  /*_saveAssociations() {
    // prevent saving when overriden by `dontSaveAssociations`
    // for reflexive relationships bug https://github.com/samselikoff/ember-cli-mirage/issues/755
    Object.keys(this.belongsToAssociations).forEach(key => {
      if (!this.dontSaveAssociations.includes(key)) {
        let association = this.belongsToAssociations[key];
        let parent = this[key];
        if (parent && parent.isNew()) {
          let fk = association.getForeignKey();
          parent.save();
          this.update(fk, parent.id);
        }
      }
    }, this);

    Object.keys(this.hasManyAssociations).forEach(key => {
      if (!this.dontSaveAssociations.includes(key)) {
        let association = this.hasManyAssociations[key];
        let children = this[key];
        children.update(association.getForeignKey(), this.id);
      }
    }, this);
  },*/

  destroy() {
    this._beforeDestroy();
    let collection = toCollectionName(this.modelName);
    this._schema.db[collection].remove(this.attrs.id);
  },

  // added call to 'default'
  save() {
    let collection = toCollectionName(this.modelName);
    if (this.isNew()) {
      // Update the attrs with the db response
      this.attrs = this._schema.db[collection].insert(this.attrs);

      // Ensure the id getter/setter is set
      this._definePlainAttribute('id');
      this.default();

    } else {
      this._schema.db[collection].update(this.attrs.id, this.attrs);
    }

    // Update associated children
    this._saveAssociations();

    return this;
  },

  hasNo(relName) {
    relName = relName.singularize();
    return this.typeOf(relName) === 'hasMany' ?
    this.hasNoOfMany(relName) :
    this.hasNoOfOne(relName);
  },
  hasNoOfOne(relName) {
    relName = relName.singularize();
    let rel = this[relName];
    if (rel) {
      //rel.destroy();
    }
    this[relName] = null;
    this.save();
    return this;
  },
  hasNoOfMany(relName) {
    relName = relName.singularize();
    // TODO: create a general deleteXX method for hasMany
    let rels = this[`${relName.pluralize()}`].models;
    this[`${relName.pluralize()}`] = [];
    rels.forEach((rel) => {
      //rel.destroy();
    });
    this[`${relName.pluralize()}`] = [];
    return this;
  },

  hasMulti(relName, nb, attrs) {
    relName = relName.singularize();
    nb = nb || 2;
    let rels = this[`${relName.pluralize()}`].models,
      initialNumber = rels.length;
    // let rel = this[`create${relName.capitalize()}`]();
    let assoc = this.hasManyAssociations[relName.pluralize()];
    let {modelName} = assoc;
    let inverseRelName = assoc.opts.inverse || this.modelName;
    if (attrs) {
      for (let i = 0; i < initialNumber; i++) {
        rels[i].update(attrs);
      }
    }
    for (let i = initialNumber; i < nb; i++) {
      let hash = attrs || {};
      hash[`${inverseRelName.camelize()}Id`] = this.id;
      rels.push(server.create(modelName, hash));
    }
    for (let i = nb; i < initialNumber; i++) {
      let rel = rels[i];
      rels.removeObject(rel);
      // rel.destroy();
    }
    this[`${relName.pluralize()}`] = rels;
    this.save();
    return this[`${relName.pluralize()}`].models;
  },

  hasOne(relName, attrs) { // exactly one
    relName = relName.singularize();
    let model = this.typeOf(relName) === 'hasMany' ?
    this.hasOneOfMany(relName) :
    this.hasOneOfOne(relName);
    if (attrs) {
      return model.updateAttrs(attrs);
    } else {
      return model;
    }
  },
  hasOneOfMany(relName) {
    relName = relName.singularize();
    assert(
      this.hasManyAssociations[relName.pluralize()],
      `can not find hasManyAssociations with name ${relName.pluralize()} in ${this.modelName} model`
    );
    // TODO: create a general deleteXX method for hasMany
    let rels = this[`${relName.pluralize()}`].models;
    let rel;
    let {length} = rels;
    if (length) {
      rel = rels[0];
      for (let i = 1; i < length; i++) {
        rels[i].destroy();
      }
      if (length > 1) {
        this[`${relName.pluralize()}`] = [rel];
      }
    } else {
      let assoc = this.hasManyAssociations[relName.pluralize()];
      let {modelName} = assoc;
      let inverseRelName = assoc.opts.inverse || this.modelName;
      // let inverseRelNameKey = assoc.getForeignKey();
      let hash = {};
      hash[`${inverseRelName.camelize()}Id`] = this.id;
      rel = server.create(modelName, hash);
    }
    this[`${relName.pluralize()}`] = [rel];
    this.save();
    return rel;
  },
  hasOneOfOne(relName) {
    relName = relName.singularize();
    assert(
      this.belongsToAssociations[relName],
      `can not find belongsToAssociation with name ${relName} in ${this.modelName} model`
    );
    let rel = this[relName];
    if (!rel) {
      let assoc = this.belongsToAssociations[relName];
      let {modelName} = assoc;
      let inverseRelName = assoc.opts.inverse || this.modelName;
      let hash = {};
      hash[`${inverseRelName.camelize()}Id`] = this.id;
      rel = server.create(modelName, hash);
      this.update(`${relName}Id`, rel.id);
    }
    return rel;
  },

  addRelationship(relName, attrs) {
    relName = relName.singularize();
    let model = this.typeOf(relName) === 'hasMany' ?
    this.addRelationshipOfMany(relName) :
    this.addRelationshipOfOne(relName);
    if (attrs) {
      return model.updateAttrs(attrs);
    } else {
      return model;
    }
  },
  deleteRelationship(relName) {
    relName = relName.singularize();
    return this.typeOf(relName) === 'hasMany' ?
    this.deleteRelationshipOfMany(relName) :
    this.deleteRelationshipOfOne(relName);
  },
  addRelationshipOfOne(relName) {
    relName = relName.singularize();
    assert(
      this.belongsToAssociations[relName],
      `can not find belongsToAssociation with name ${relName} in ${this.modelName} model`
    );
    let rel = this[relName];
    assert(
      !rel,
      `can not add a model to an already existing belongsTo relationship ${relName} in ${this.modelName} model`
    );
    return this.hasOneOfOne(relName);
  },
  deleteRelationshipOfOne(relName) {
    relName = relName.singularize();
    assert(
      this.belongsToAssociations[relName],
      `can not find belongsToAssociation with name ${relName} in ${this.modelName} model`
    );
    let rel = this[relName];
    assert(
      rel,
      `can not remove a model to an already empty belongsTo relationship ${relName} in ${this.modelName} model`
    );
    return this.hasNoOfOne(relName);
  },
  addRelationshipOfMany(relName) {
    relName = relName.singularize();
    let rels = this[`${relName.pluralize()}`].models;
    let assoc = this.hasManyAssociations[relName.pluralize()];
    let {modelName} = assoc;
    let inverseRelName = assoc.opts.inverse || this.modelName;
    let hash = {};
    hash[`${inverseRelName.camelize()}Id`] = this.id;
    let model = server.create(modelName, hash);
    rels.push(model);
    this[`${relName.pluralize()}`] = rels;
    this.save();
    return model;
  },
  deleteRelationshipOfMany(relName, model) {
    relName = relName.singularize();
    let rels = this[`${relName.pluralize()}`].models;
    model = model || rels[rels.length-1];
    rels.removeObject(model);
    //model.destroy();
    this[`${relName.pluralize()}`] = rels;
    this.save();
    return this;
  },
  snapshot() {
    let hash = {};
    hash.flags = this.flags.map((flag) => {
      return {
        name: flag.name,
        value: this[flag.name]
      };
    });
    hash.associations = this.childrenAssociations.map((relName) => {
      let rel = this[relName],
        belongsTo = !rel || !rel.models,
        hasMany = !belongsTo;
      return {
        name: relName,
        count: belongsTo ? (rel ? 1 : 0) : rel.models.length,//eslint-disable-line
        models: belongsTo ? (rel ? [rel.snapshot()] : []) : rel.models.map((model) => {return model.snapshot();})
      };
    });
    return hash;
  },
  fromSnapshot(snapshot) {
    if (snapshot) {
      snapshot.flags.forEach(({name, value}) => {
        let flag = this.flags.findBy('name', name);
        if (flag.method) {
          this[flag.method](value);
        } else {
          this.update(name, value);
        }
      }),
      snapshot.associations.forEach(({name, count, models}) => {
        let rels = [];
        switch (count) {
          case 0:
            this.hasNo(name);
            break;
          case 1:
            rels = [this.hasOne(name)];
            break;
          default:
            rels = this.hasMulti(name, count);
        }
        rels.forEach((rel, index) => {
          rel.fromSnapshot(models[index]);
        });
      });
    }
  }
});

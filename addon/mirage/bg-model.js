import { Model } from 'ember-cli-mirage';
import { toCollectionName } from 'ember-cli-mirage/utils/normalize-name';
import assert from 'ember-cli-mirage/assert';
import { pluralize, singularize, camelize } from 'ember-inflector';

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
    let relNames = pluralize(relName);
    return this[relNames] ? 'hasMany' : 'belongsTo';
  },

  _beforeDestroy() {
    this.associationKeys.forEach((relName) => {
      if (this.childrenAssociations.indexOf(relName) > -1) {
        this.hasNo(relName);
      }
    });
  },

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
    relName = singularize(relName);
    return this.typeOf(relName) === 'hasMany' ?
    this.hasNoOfMany(relName) :
    this.hasNoOfOne(relName);
  },
  hasNoOfOne(relName) {
    relName = singularize(relName);
    let rel = this[relName];
    if (rel) {
      let assoc = this.belongsToAssociations[relName];
      let {modelName} = assoc;
      let inverseRelName = assoc.opts.inverse || this.modelName;
      //rel[inverseRelName] = null;
      //rel.destroy();
      rel._beforeDestroy();
    }
    this[relName] = null;
    this.save();
    return this;
  },
  hasNoOfMany(relName) {
    relName = singularize(relName);
    // TODO: create a general deleteXX method for hasMany
    let relNames = pluralize(relName),
      rels = this[relNames].models;
    this[relNames] = [];
    let assoc = this.hasManyAssociations[relNames];
    let {modelName} = assoc;
    let inverseRelName = assoc.opts.inverse || this.modelName;
    rels.forEach((rel) => {
      //debugger;
      rel._beforeDestroy();
      //rel.update(`${inverseRelName}Id`, null);
      //rel.destroy();
    });
    this[relNames] = [];
    this.save();
    return this;
  },

  hasMulti(relName, nb, attrs) {
    relName = singularize(relName);
    let relNames = pluralize(relName);
    nb = nb || 2;
    let rels = this[relNames].models,
      initialNumber = rels.length;
    // let rel = this[`create${relName.capitalize()}`]();
    let assoc = this.hasManyAssociations[relNames];
    let {modelName} = assoc;
    let inverseRelName = assoc.opts.inverse || this.modelName;
    if (attrs) {
      for (let i = 0; i < initialNumber; i++) {
        rels[i].update(attrs);
      }
    }
    for (let i = initialNumber; i < nb; i++) {
      let hash = attrs || {};
      hash[`${camelize(inverseRelName)}Id`] = this.id;
      rels.push(server.create(modelName, hash));
    }
    for (let i = nb; i < initialNumber; i++) {
      let rel = rels[i];
      rels.removeObject(rel);
      // rel.destroy();
    }
    this[relNames] = rels;
    this.save();
    return this[relNames].models;
  },

  hasOne(relName, attrs) { // exactly one
    relName = singularize(relName);
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
    relName = singularize(relName);
    let relNames = pluralize(relName);
    assert(
      this.hasManyAssociations[relNames],
      `can not find hasManyAssociations with name ${relNames} in ${this.modelName} model`
    );
    // TODO: create a general deleteXX method for hasMany
    let rels = this[relNames].models;
    let rel;
    let {length} = rels;
    if (length) {
      rel = rels[0];
      if (length > 1) {
        this[relNames] = [rel];
        this.save();
      }
      /*for (let i = 1; i < length; i++) {
        rels[i].destroy();
      }*/
    } else {
      let assoc = this.hasManyAssociations[relNames];
      let {modelName} = assoc;
      let inverseRelName = assoc.opts.inverse || this.modelName;
      // let inverseRelNameKey = assoc.getForeignKey();
      let hash = {};
      hash[`${camelize(inverseRelName)}Id`] = this.id;
      rel = server.create(modelName, hash);
      this[relNames] = [rel];
      this.save();
    }
    return rel;
  },
  hasOneOfOne(relName) {
    relName = singularize(relName);
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
      hash[`${camelize(inverseRelName)}Id`] = this.id;
      rel = server.create(modelName, hash);
      this.update(`${relName}Id`, rel.id);
    }
    return rel;
  },

  addRelationship(relName, attrs) {
    relName = singularize(relName);
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
    relName = singularize(relName);
    return this.typeOf(relName) === 'hasMany' ?
    this.deleteRelationshipOfMany(relName) :
    this.deleteRelationshipOfOne(relName);
  },
  addRelationshipOfOne(relName) {
    relName = singularize(relName);
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
    relName = singularize(relName);
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
    relName = singularize(relName);
    let relNames = pluralize(relName);
    let rels = this[relNames].models;
    let assoc = this.hasManyAssociations[relNames];
    let {modelName} = assoc;
    let inverseRelName = assoc.opts.inverse || this.modelName;
    let hash = {};
    hash[`${camelize(inverseRelName)}Id`] = this.id;
    let model = server.create(modelName, hash);
    rels.push(model);
    this[relNames] = rels;
    this.save();
    return model;
  },
  deleteRelationshipOfMany(relName, model) {
    relName = singularize(relName);
    let relNames = pluralize(relName);
    let rels = this[relNames].models;
    model = model || rels[rels.length-1];
    rels.removeObject(model);
    //model.destroy();
    this[relNames] = rels;
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
  },
  //https://github.com/samselikoff/ember-cli-mirage/issues/1061
  update(key, val) {
    let attrs;
    if (key == null) {
      return this;
    }

    if (typeof key === 'object') {
      attrs = key;
    } else {
      (attrs = {})[key] = val;
    }

    Object.keys(attrs).forEach(function(attr) {
      if (!Object.keys(this.belongsToAssociations).includes(attr) &&
        !Object.keys(this.hasManyAssociations).includes(attr)) {
        this._definePlainAttribute(attr);
      }
      this[attr] = attrs[attr];
    }, this);

    this.save();

    return this;
  }
});

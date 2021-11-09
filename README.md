# ember-cli-mirage-nested

This addon does two different things at the moment and will be soon split into **ember-cli-mirage-scenario-chaining** and **ember-cli-mirage-gui**


Compatibility
------------------------------------------------------------------------------

* Ember.js v3.20 or above
* Ember CLI v3.20 or above
* Node.js v12 or above


Installation
------------------------------------------------------------------------------

# Demo

https://britishgas-engineering.github.io/ember-cli-mirage-nested

# 1) ember-cli-mirage-scenario-chaining

Define your Mirage scenario with nested syntax such as:

```javascript
server.create('parent').hasOne('child').hasOne('grandChild');
```

### Features

We created a few very useful methods to be used on Mirage models (once they are extended using our mixin), allowing to easily create scenarii:

* `hasOne` : the parent model instance has one and only one child model instance (given a relationship parent to child has been set).
example:
```javascript
//mirage/scenarios/default.js
const parent = server.create('parent');
const child = parent.hasOne('child', {propertyOfTheChild: value})
parent.child === child //true
```

* `hasMulti` : the parent model instance has multiple child model instance (given a `hasMany` relationship parent to child has been set).
example:
```javascript
//mirage/scenarios/default.js
const parent = server.create('parent');
const children = parent.hasMulti('children', 3, {propertyThatAllTheChildrenWillHave: value})
parent.children.models === children //true
```

* `hasNo` : the parent model instance has no child model instance (given a relationship parent to child has been set).
example:
```javascript
//mirage/scenarios/default.js
const parent = server.create('parent');
parent.hasNo('child');
parent.child === null //true
```

* In addition we added a `default` method available for each Mirage model, which will be run whenever a new model instance is created - similar to an `init` method, this allows to create default children relationships on model creation

### Usage

Extend your Mirage models from the bg-model-mixin in this addon, for example:

```javascript
//mirage/models/bg-model.js
import { Model } from 'ember-cli-mirage';
import EmberCliMirageNestedMixin from  'ember-cli-mirage-nested/mirage/bg-model-mixin';

export default Model.extend(EmberCliMirageNestedMixin);
```

```javascript
//mirage/models/parent.js
import BgModel from './bg-model';
import { hasMany, belongsTo } from 'ember-cli-mirage';

export default BgModel.extend({
  childrenAssociations: ['children'],//will be destroyed when this model instance is destroyed
  children: hasMany('child', {inverse: 'parent'})
  default() {//will be run every time a new "parent" model instance is created
    const children = this.hasMulti('children', 3);
  }
});
```

# 2) ember-cli-mirage-gui

This addon adds some methods in Mirage models allowing to create a Graphical User Interface in your app to easily create Mirage scenario, like the one in [our demo](https://britishgas-engineering.github.io/ember-cli-mirage-nested).

Only alpha version for now (components for the GUI are in the dummy app of this addon), documentation / wiki is in progress.

Set all the options for this functionality in a `forGUI` object in your model

```javascript
//mirage/models/parent.js
import BgModel from './bg-model';
import { hasMany, belongsTo } from 'ember-cli-mirage';

export default BgModel.extend({
  childrenAssociations: ['children'],  
  children: hasMany('child', {inverse: 'parent'}),
  forGUI: {
    allowChangeNbAssociations: ['children'],//allows changing the associations in the GUI
    flags: [{
      name: 'title',//allow to change the "title" attribute of this model in the GUI
      displayName: 'titleGui',// (optional) allows to show a different name for the attribute in the GUI
      options: [//set the options for the title
        'The title attribute of this model is set on init in the "default" hook of the model.',
        'Also, this model has two children by default.'
      ],
      method: 'updateTitle'//(optional) if set, then you will call this method in the model when changing the GUI instead of changing the attribute
    }]
  },
  default() {//will be run every time a new "parent" model instance is created
    const children = this.hasMulti('children', 3);
  }
});
```

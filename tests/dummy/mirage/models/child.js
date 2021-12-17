import BgModel from './bg-model';
import { hasMany, belongsTo } from 'ember-cli-mirage';

export default BgModel.extend({
  childrenAssociations: ['children'],
  children: hasMany('grand-child', { inverse: 'parent' }),
  parent: belongsTo('parent'),
  default() {
    this.update(
      'title',
      'The title attribute of this model is set on init in the "default" hook of the model.'
    );
    this.hasMulti('children', 2);
  },
  forGUI: {
    allowChangeNbAssociations: ['children'],
    flags: [
      {
        name: 'title',
        options: [
          'The title attribute of this model is set on init in the "default" hook of the model.',
          'Also, this model has two children by default.',
        ],
      },
    ],
  },
});

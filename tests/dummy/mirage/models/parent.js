import BgModel from './bg-model';
import { hasMany } from 'ember-cli-mirage';

export default BgModel.extend({
  childrenAssociations: ['children'],
  forGUI: {
    allowChangeNbAssociations: ['children'],
  },
  children: hasMany('child', { inverse: 'parent' }),
});

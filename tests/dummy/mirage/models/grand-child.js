import BgModel from './bg-model';
import { belongsTo } from 'ember-cli-mirage';

export default BgModel.extend({
  parent: belongsTo('child')
});

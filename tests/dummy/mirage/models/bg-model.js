import { Model } from 'ember-cli-mirage';
import EmberCliMirageNestedMixin from 'ember-cli-mirage-nested/mirage/bg-model-mixin';

export default class BgModel extends Model.extend(EmberCliMirageNestedMixin) {}

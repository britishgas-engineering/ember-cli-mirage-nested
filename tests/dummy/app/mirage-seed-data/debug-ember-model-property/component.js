import Component from '@glimmer/component';
import { decamelize } from '@ember/string';
import { copy } from 'ember-copy';

export default class DebugEmberModelPropertyComponent extends Component {
  get propertyNameDisplay() {
    return decamelize(this.args.propertyName).split('_').join(' ');
  }

  get propertyVal() {
    const model = this.args.model,
      propertyName = this.args.propertyName;
    return !model ? 'loading..' : { value: model.get(propertyName) };
  }

  get dynamicPropertyVal() {
    return this.propertyVal.value;
  }

  get result() {
    let val = this.dynamicPropertyVal;
    if (!val) {
      return val;
    }
    if (val.then) {
      if (val.isFulfilled) {
        return true;
      } else if (val.isRejected) {
        return false;
      } else {
        return 'loading..';
      }
    } else {
      return val;
    }
  }

  get reason() {
    let val = this.dynamicPropertyVal;
    if (!val) {
      return val;
    }
    if (val.isFulfilled) {
      return {};
    } else {
      let hash = copy(val.reason, true);
      hash = (!hash || hash.length) ? hash : [hash];// eslint-disable-line
      return hash
        ? hash.map((reas) => {
            return JSON.stringify(reas);
          })
        : null;
    }
  }

  get modelName() {
    const model = this.args.model;

    return model ? model.constructor.modelName : '';
  }
}

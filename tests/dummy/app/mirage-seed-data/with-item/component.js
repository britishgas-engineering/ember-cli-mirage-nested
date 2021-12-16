import Component from '@glimmer/component';

export default class WithItemComponent extends Component {
  get item() {
    let object = this.args.object ?? {};
    const keys = this.args.key.split('.');

    keys.forEach((key) => {
      object = object[key];
    });

    return object;
  }
}

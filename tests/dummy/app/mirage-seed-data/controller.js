import Controller from '@ember/controller';
import { set, action } from '@ember/object';

export default class MirageSeedDataController extends Controller {
  @action refreshModel() {
    this.send('refreshRouteModel');
  }

  @action sendError(error) {
    set(this, 'error', error);
  }
}

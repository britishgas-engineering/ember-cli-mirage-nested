import AppSerializer from './application';

export default AppSerializer.extend({
  include() {
    return ['children'];
  }
});

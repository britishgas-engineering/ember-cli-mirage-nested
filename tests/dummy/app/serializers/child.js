import AppSerializer from './application';

export default AppSerializer.extend({
  keyForRelationship(key) {
    return key === 'children' ? 'childs' : key;
  },
});

import Ember from 'ember';

export function eq(params/*, hash*/) {
  return Ember.isEqual(params[0], params[1]);
}

export default Ember.Helper.helper(eq);

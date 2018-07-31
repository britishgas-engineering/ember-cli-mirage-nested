import { JSONAPISerializer } from 'ember-cli-mirage';

export default JSONAPISerializer.extend({
  keyForAttribute(attr) {
    return attr.camelize().replace('Id', '');
  },
  keyForRelationshipIds(modelName) {
    return `${modelName.camelize().singularize()}s`;
  },
  normalize(payload) {
    let type = Object.keys(payload)[0];
    let attrs = payload[type];

    let jsonApiPayload = {
      data: {
        type: type.pluralize(),
        attributes: {}
      }
    };
    if (attrs.id) {
      jsonApiPayload.data.id = attrs.id;
    }
    Object.keys(attrs).forEach(key => {
      if (key !== 'id') {
        let normalizedKey = key;
        // server sends payload with keys as "register" instead of "registerId"
        if (Object.keys(server.schema).includes(key.pluralize())) {
          normalizedKey = `${key}Id`;
        }
        jsonApiPayload.data.attributes[normalizedKey] = attrs[key];
      }
    });

    return jsonApiPayload;
  },
  _formatAttributeKeys(attrs) {

    let formattedAttrs = {};

    for (let key in attrs) {
      let formattedKey = this.keyForAttribute(key);
      formattedAttrs[formattedKey] = attrs[key];
    }
    // not provided by server yet
    delete formattedAttrs.server;

    return formattedAttrs;
  }
});

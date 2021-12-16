import { camelize } from '@ember/string';
import { RestSerializer } from 'ember-cli-mirage';
import { pluralize, singularize } from 'ember-cli-mirage/utils/inflector';

export default RestSerializer.extend({
  keyForAttribute(attr) {
    return camelize(attr).replace('Id', '');
  },
  keyForRelationshipIds(modelName) {
    return `${singularize(camelize(modelName))}s`;
  },
  normalize(payload) {
    let type = Object.keys(payload)[0];
    let attrs = payload[type];

    let jsonApiPayload = {
      data: {
        type: pluralize(type),
        attributes: {},
      },
    };
    if (attrs.id) {
      jsonApiPayload.data.id = attrs.id;
    }
    Object.keys(attrs).forEach((key) => {
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
  },
});

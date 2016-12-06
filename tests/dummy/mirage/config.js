export default function() {
  this.get('parents', function ({parents}) {
    let serialized = this.serialize(parents.all());
    delete serialized.children;
    delete serialized.grandChildren;
    return serialized;
  });

  this.get('children/:id', function ({children}, request) {
    let serialized = this.serialize(children.find(request.params.id));
    delete serialized.grandChildren;
    return serialized;
  });

  this.get('grandChildren/:id', function ({grandChildren}, request) {
    let serialized = this.serialize(grandChildren.find(request.params.id));
    return serialized;
  });
}

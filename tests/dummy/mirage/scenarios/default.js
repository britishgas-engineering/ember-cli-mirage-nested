export default (server) => {
  window.server = server;
  server.create('parent').hasOne('child').hasOne('child');
  /*
    Seed your development database using your factories.
    This data will not be loaded in your tests.

    Make sure to define a factory for each model you want to create.
  */

  //server.createList('post', 10);
}

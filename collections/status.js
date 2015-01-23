Status = new Mongo.Collection('status');

if (Meteor.isServer) {
  Houston.add_collection(Meteor.users);
  Houston.add_collection(Houston._admins);

  Meteor.startup(function() {
    var status = Status.findOne({
      'content': 'dummy status'
    });
    if (status === undefined) {
      Status.insert({
        'title':'demo',
        'content':'dummy status',
        'type':'edito',
        'screenName':'foobar'
      });
    } else {
      console.log('Collection/Status - demo status added.');
    }
  });
}
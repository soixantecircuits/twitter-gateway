Status = new Mongo.Collection('status');

  Houston.add_collection(Meteor.users);
  Houston.add_collection(Houston._admins);

  Meteor.startup(function() {
    var status = Status.findOne({
      'content': 'dummy status'
    });
    if (status === undefined) {
      Status.insert({
        'title': 'demo',
        'content': 'dummy status',
        'type': 'edito',
        'screenName': Meteor.settings.screenName
      });
    } else {
      console.log('Collection/Status - demo status added.');
    }
  });
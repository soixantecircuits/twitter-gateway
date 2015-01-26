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
    if (Status.find().count() < 10) {
        console.log("Importing private/status.json to db")

        var data = JSON.parse(Assets.getText("status.json"));

        data.forEach(function (item, index, array) {
            Status.insert(item);
        })
    }
    var status = Status.findOne({
      'screenName': 'EugeneLeBot'
    });
    if (status === undefined) {
        console.log("Importing private/status_eugene.json to db")
        var data = JSON.parse(Assets.getText("status_eugene.json"));
        data.forEach(function (item, index, array) {
            Status.insert(item);
        })
    }
  });

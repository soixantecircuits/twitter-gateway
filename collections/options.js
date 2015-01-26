Options = new Mongo.Collection('options');
if (Meteor.isServer) {
  Meteor.startup(function() {

    if (Options.find({}).fetch().length < 1) {
      Options.insert([{
        name: 'autoTweet',
        value: true,
        type: 'checkbox'
      }]);
    }
  });
}
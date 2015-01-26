if(Meteor.isClient){
    Template.list.helpers({
      'userInCollection': function(){
          return Meteor.users.find();
      }
    });
    Template.list.events({
      'click .remove': function (evt) {
        //console.log($(evt.target).data('screenname'));
        var screenName = $(evt.target).data('screenname');
        Meteor.call('removeTwitts', screenName, function(error, result){
          if(error){
            console.log(error);
          } else {
            console.log(result);
          }
        });
      }
    });
}
if(Meteor.isClient){
    Template.options.helpers({
      'optionsInCollection': function(){
          return Options.find({}).fetch();
      }
    });
    Template.options.events({
      'click': function (evt) {
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
var TwittAPI = Meteor.npmRequire('twit'),
  _ = Meteor.npmRequire('lodash');

var status = [];

var twitt = new TwittAPI(Meteor.settings.twitter);

var postATwitt = function(val, cb) {
  if (setUser(val)) {
    twitt.post('statuses/update', {
      status: new Date() + ' : ' + status[0].content
    }, function(err, data, response) {
      if (err) {
        //console.log(err);
        cb(err);
      } else {
        //console.log(data);
        cb(undefined, data);
      }
    })
  } else {
    console.log('Can\'t find user, with screen name: ' + val);
  }
}

var setUser = function(screenName) {

  var user = Meteor.users.findOne({
    'services.twitter.screenName': screenName
  });

  if (user) {
    twitt.setAuth({
      'access_token': user.services.twitter.accessToken,
      'access_token_secret': user.services.twitter.accessTokenSecret
    });

    //status = ['Mama mia'];
    status = Status.find({
      'screenName': screenName
    }).fetch();
    return true;
  } else {
    return false;
  }
}

Router.route('/twitt', {
    where: 'server'
  })
  .get(function() {
    var params = this.params;
    response = this.response;

    postATwitt(params.query.scrname, Meteor.bindEnvironment(function(err, res) {
      if (err) {
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({
          msg: 'Error, while posting twitt for: ' + params.query.scrname,
          data: err
        }));
      } else {
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({
          msg: 'Twitt posted for: ' + params.query.scrname,
          data: res
        }));
      }
    }));
  })
  .post(function() {
    this.response.end('post request\n');
  });
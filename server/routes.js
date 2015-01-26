var TwittAPI = Meteor.npmRequire('twit'),
  _ = Meteor.npmRequire('lodash');

var status = [];

var twitt = new TwittAPI(Meteor.settings.twitter);

var postATwitt = function(val, pufNum, cb) {
  if (setUser(val)) {
    var pick = Math.floor(Math.random() * status.length);
    var pufNumHashtag = pufNum === ''? '' : '#fatBoy'+pufNum;
    twitt.post('statuses/update', {
      status: status[pick].content + ' ' + Meteor.settings.hashtag + ' ' + pufNumHashtag + ' '  + Date.now()
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
    console.log('Can\'t find user, with screen name: '+val + ' at ' + Date.now());
    cb('Can\'t find user with screen name ' + val, null);
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
    var pufNum = params.query.pufNum === undefined? '': params.query.pufNum;
    postATwitt(params.query.scrname, pufNum, Meteor.bindEnvironment(function(err, res) {
      if (err) {
        response.setHeader('Content-Type', 'application/json');
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.end(JSON.stringify({
          msg: 'Error, while posting twitt for: ' + params.query.scrname,
          data: err
        }));
      } else {
        response.setHeader('Content-Type', 'application/json');
        response.setHeader("Access-Control-Allow-Origin", "*");
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

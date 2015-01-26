var TwittAPI = Meteor.npmRequire('twit'),
  _ = Meteor.npmRequire('lodash');

var status = [];

var twitt = new TwittAPI(Meteor.settings.twitter);

var statusByName = originalStatusAction = {};

var setupDataTweet = function() {
  var statusAction = Status.find({
    type: 'action'
  }).fetch();

  _.each(statusAction, function(status, index) {
    if (typeof statusByName[status.screenName] === 'undefined') {
      statusByName[status.screenName] = []
    }
    statusByName[status.screenName].push(status);
  });
  originalStatusAction = JSON.parse(JSON.stringify(statusByName));
};

var postATwitt = function(screenName, pufNum, cb) {
  if (setUser(screenName)) {
    var letters = ['o', 'a', 'i', 'ey', 'u', 'e', 'y'],
      sample = _.sample(_.shuffle(letters), 1),
      interjection = 'H' + sample,
      pufNumHashtag = pufNum === '' ? '' : '#fatBoy' + pufNum,
      content = '';

    if (typeof statusByName[screenName] === 'undefined') {
      console.log('no status of type action for: ' + screenName);
    } else {
      if (statusByName[screenName].length < 1) {
        console.log('Approvisionning status...');
        statusByName[screenName] = _.shuffle(originalStatusAction[screenName].slice());
      }
      if (typeof statusByName[screenName] !== 'undefined' && statusByName[screenName].length >= 1) {
        content = statusByName[screenName].pop().content;
        console.log('---- posting for: ', screenName);
        twitt.post('statuses/update', {
          status: interjection + '! ' + content + ' ' + Meteor.settings.hashtag + ' ' + pufNumHashtag + ' '
        }, function(err, data, response) {
          if (err) {
            //console.log(err);
            cb(err);
          } else {
            //console.log(data);
            cb(undefined, data);
          }
        });
      } else {
        console.log('Nothing to reply, add some status...');
      }
    }
  } else {
    console.log('Can\'t find user, with screen name: ' + screenName + ' at ' + Date.now());
    cb('Can\'t find user with screen name ' + screenName, null);
  }
}

var setUser = function(screenName) {
  var user = Meteor.users.findOne({
    'services.twitter.screenName': screenName
  });
  if (user) {
    console.log('---- auth set for: ', screenName);
    console.log(user.services.twitter);
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
    var pufNum = params.query.pufNum === undefined ? '' : params.query.pufNum;
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

Meteor.startup(function() {
  setupDataTweet();
});
var TwittAPI = Meteor.npmRequire('twit'),
  _ = Meteor.npmRequire('lodash'),
  Fiber = Meteor.npmRequire('fibers'),
  Future = Meteor.npmRequire('fibers/future'),
  twitt = new TwittAPI(Meteor.settings.twitter),
  statusActionByName = statusEditoByName = originalStatusAction = originalStatusEdito = {};

var setupDataTweet = function() {
  var statusAction = Status.find({
    type: 'action'
  }).fetch();

  _.each(statusAction, function(status, index) {
    if (typeof statusActionByName[status.screenName] === 'undefined') {
      statusActionByName[status.screenName] = []
    }
    statusActionByName[status.screenName].push(status);
  });
  originalStatusAction = JSON.parse(JSON.stringify(statusActionByName));

  var statusEdito = Status.find({
    type: 'edito'
  }).fetch();

  _.each(statusEdito, function(status, index) {
    if (typeof statusEditoByName[status.screenName] === 'undefined') {
      statusEditoByName[status.screenName] = []
    }
    statusEditoByName[status.screenName].push(status);
  });
  originalStatusEdito = JSON.parse(JSON.stringify(statusEditoByName));
};

var autoTwitt = function() {
  users = Meteor.users.find({}).fetch();

  _.each(users, function(user, index) {
    var interval = Random.choice(Meteor.settings.intervalAutoTweet);
    if (typeof user.services.twitter !== "undefined") {
      var botScreenName = user.services.twitter.screenName
      if(botScreenName.toLowerCase() === 'AugusteLeBot'.toLowerCase()){
        interval = Random.choice(Meteor.settings.intervalAutoTweet) * 5;
      }
      Meteor.setTimeout(function autoPostTwitt() {
        if (typeof statusEditoByName[botScreenName] === 'undefined') {
          console.log('no status of type action for: ' + botScreenName);
        } else {
          if (statusEditoByName[botScreenName].length < 1) {
            console.log('Approvisionning status...');
            statusEditoByName[botScreenName] = _.shuffle(originalStatusEdito[botScreenName].slice());
          }
          if (typeof statusEditoByName[botScreenName] !== 'undefined' && statusEditoByName[botScreenName].length >= 1) {
            postMsg(botScreenName, statusEditoByName[botScreenName].pop().content);
          } else {
            console.log('Nothing to reply, add some status...');
          }
        }
      }, interval);
    }
  });
};


var reply = function(from, to, msg) {
  Fiber(function() {
    //var val = setUser(from);
    if (setUser(from)) {
      var letters = ['o', 'a', 'i', 'ey', 'u', 'e', 'y'],
        sample = _.sample(_.shuffle(letters), 1),
        interjection = 'h' + sample;
      twitt.post('statuses/update', {
        status: interjection + '! @' + to + ', ' + msg
      }, function(err, data, response) {
        if (err) {
          console.log(err);
        } else {
          console.log(data);
        }
      });
    } else {
      console.log('Can\'t find user, with screen name: ' + from);
    }
  }).run();
};

var postMsg = function(from, msg) {
  Fiber(function() {
    //var val = setUser(from);
    if (setUser(from)) {
      var letters = ['o', 'a', 'i', 'ey', 'u', 'e', 'y'],
        sample = _.sample(_.shuffle(letters), 1),
        interjection = 'H' + sample;
      twitt.post('statuses/update', {
        status: interjection + '! ' + msg + ' ' + Meteor.settings.hashtag
      }, function(err, data, response) {
        if (err) {
          console.log('** postMsg : Error while posting with ', from)
          console.log(err);
        } else {
          console.log(data);
        }
      });
    } else {
      console.log('Can\'t find user, with screen name: ' + from);
    }
  }).run();
}

var setUser = function(screenName) {
  var fut = new Future();
  var user = Meteor.users.findOne({
    'services.twitter.screenName': screenName
  });
  console.log(screenName);
  if (user) {
    twitt.setAuth({
      'access_token': user.services.twitter.accessToken,
      'access_token_secret': user.services.twitter.accessTokenSecret
    });
    fut.return(true);
  } else {
    fut.return(false);
  }
  return fut.wait();
}

Meteor.startup(function() {

  setupDataTweet();

  if (Meteor.settings.autoTweet) {
    autoTwitt();
    Meteor.setInterval(function autoPostTwitt() {
      autoTwitt();
    }, 60000);
  }

  users = Meteor.users.find({}).fetch(),
    toFollow = [],
    toTrack = [];

  _.each(users, function(user, index) {
    if (typeof user.services.twitter !== "undefined") {
      toFollow.push(user.services.twitter.id);
      toTrack.push('@' + user.services.twitter.screenName);
    }
  });

  if (toTrack.length > 0) {
    var stream = twitt.stream('statuses/filter', {
      //follow: toFollow,
      track: toTrack
    });

    stream.on('tweet', function(tweet) {
      /*console.log(tweet.user.screen_name + ': ' + tweet.text);
      console.log(tweet, tweet.entities.user_mentions);*/
      _.each(tweet.entities.user_mentions, function(user, index) {
        if (typeof statusActionByName[user.screen_name] === 'undefined') {
          console.log('no status of type action for: ' + user.screen_name);
        } else {
          if (statusActionByName[user.screen_name].length < 1) {
            console.log('Approvisionning status...');
            statusActionByName[user.screen_name] = _.shuffle(originalStatusAction[user.screen_name].slice());
          }
          if (typeof statusActionByName[user.screen_name] !== 'undefined' && statusActionByName[user.screen_name].length >= 1) {
            reply(user.screen_name, tweet.user.screen_name, statusActionByName[user.screen_name].pop().content);
          } else {
            console.log('Nothing to reply, add some status...');
          }
        }
      });
    });

    stream.on('error', function(err) {
      console.log('Error on stream: ');
      console.log(err);
    });
  }
});

Meteor.methods({
  removeTwitts: function(screenName) {
    var fut = new Future();
    if (setUser(screenName)) {
      //https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=twitterapi&count=2
      twitt.get('statuses/user_timeline', {},
        function(err, data, response) {
          if (err) {
            fut.return(new Meteor.Error("error-while-fetching", err));
          } else {
            //console.log(data);
            var nbtwitts = data.length
            _.each(data, function(tweet, index) {
              twitt.post('statuses/destroy/:id', {
                id: tweet.id_str
              }, function(err, data, response) {});
            });
            fut.return(data);
          }
        });
    } else {
      fut.return(new Meteor.Error("no-tweeter-user-found", "No user found"));
    }
    return fut.wait();
  }
});
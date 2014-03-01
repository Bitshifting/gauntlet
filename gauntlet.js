var express = require('express');
var app = express();

var mongo = require('mongodb'), format = require('util').format, ObjectID = require('mongodb').ObjectID;
var db = new mongo.Db('gauntlet', new mongo.Server('localhost', 27017, {}), {safe: true});

db.open(function() {
  console.log("Database online!");
});


/**
 * User signup
 */
app.get('/gauntlet/account/register/:username/:passwordhash', function(req, res) {
  console.log('Attempting to create account "' + req.params.username + '"...\n\t');

  db.collection('accounts', function(err, collection) {
    if (err) {
      console.log("ERR_register_1");
      res.json({success:false});
      throw err;
    }

    //Check if the username already exists...
    collection.find({username : req.params.username}, {}, function(err, cursor) {
      if (err) {
        console.log("ERR_register_2");
        res.json({success:false});
        throw err;
      }

      cursor.count(function(err, count) {
        if (err) {
          console.log("ERR_register_3");
          res.json({success:false});
          throw err;
        }

        if (count != 0) {
          //Aww, already exists.
          console.log('Account already exists');
          res.json({success:false});
          return;
        }

        collection.insert(
          {
            date: Math.round(new Date().getTime() / 1000),
            username: req.params.username,
            passwordhash: req.params.passwordhash,
          },
          function(err, count) {
            if (err) {
              res.json({success:false});
              throw err;
            }

            console.log('Account created');
            res.json({success:true});
          }
        );
      });
    });
  });
});


/**
 * User authentication. For now, their unique authentication token will just be their ID.
 * Yes, vulnerable to replay attacks, but keep it simple for the hackathon, will fix it later.
 * Returns a user token which the user must provide in the future to verify their identity.
 */
app.get('/gauntlet/account/authenticate/:username/:passwordhash', function(req, res) {
  console.log("User attempting auth " + req.params.username + "," + req.params.passwordhash);
  db.collection('accounts', function(err, collection) {
    if (err) {
      console.log("ERR_auth_1");
      res.json({success:false});
      throw err;
    }

    collection.find({username:req.params.username, passwordhash: req.params.passwordhash}, function(err, cursor) {
      cursor.count(function(err, count) {
        if (err) {
          console.log("ERR_auth_2");
          res.json({success:false});
          throw err;
        }
        if (count == 0) {
          console.log("User failed authentication");
          res.json({success:false,auth:'null'});
          return;
        }

        //The user-passwordhash tuple is in the database, so authentication success.
        console.log("User passed authentication");

        cursor.toArray(function(err, documents) {
          console.log("Sending auth token.");
          res.json({success:true,auth:documents[0]._id});
        });
      });
    });
  });
});

/**
 * Checks if an authentication token corresponds to a particular user.
 */
function checkToken(token, user) {
  console.log('Attempting to authenticate <' + token + ',' + user +'>');
  console.log("faking the auth for testing");
  return true;

  db.collection('accounts', function(err, collection) {
    if (err) {
      throw err;
    }

    collection.find({username: user, _id: new ObjectId(token)}, {}, function(err, cursor) {
      if (err) {
        throw err;
      }

      cursor.count(function(err, count) {
        if (count == 0) {
          console.log('Authentication failed for (' + user + ',' + token + ')');
          return false;
        }
        return true;
      });
    });
  });
}

/**
 * Get minion list.
 */
app.get('/gauntlet/minions/list/:auth/:username', function (req, res) {
  console.log("Attempting to list minions...");
  //Usename can be different than auth here, don't bother checking.
 // if (!checkToken(req.params.auth, req.params.username)) {
 //   console.log("ERR_list_1");
 //   res.json({success:false});
 //  return false;
 // }

  db.collection('minions', function(err, collection) {
    if (err) {
      console.log("ERR_list_2");
      res.json({success:false});
      throw err;
    }

    collection.find({username: req.params.username},{}, function(err, cursor) {
      if (err) {
        console.log("ERR_list_3");
        res.json({success:false});
        throw err;
      }

      cursor.toArray(function(err, documents) {
        if (err) {
          console.log("ERR_list_4");
          res.json({success:false});
          throw err;
        }
        console.log("Sending minion list:\n%j", documents);
        res.json(documents);
      });
    });
  });
});

/**
 * Capture a minion!
 */
app.get('/gauntlet/minions/capture/:auth/:username/:minion_picture/:minion_name/:minon_description/:minion_type/:minion_moveID1/:minion_moveAlias1/:minion_moveID2/:minion_moveAlias2/:minion_moveID3/:minion_moveAlias3/:minion_moveID4/:minion_moveAlias4/:minion_stat_strength/:minion_stat_intelligence/:minion_stat_dexterity/:minion_stat_speed/:minion_stat_health/:minion_stat_coffeemaking', function(req, res) {
  console.log("Attempting to capture minion...");
  if (!checkToken(req.params.auth, req.params.username)) {
    console.log('ERR_capture_1');
    res.json({success:false});
    return false;
  }

  db.collection('minions', function(err, collection) {
    if (err) {
      console.log('ERR_capture_2');
      res.json({success:false});
    }

    var obj =   {
      date: Math.round(new Date().getTime() / 1000),
      username: req.params.username,
      minion_picture: req.params.minion_picture,
      minion_name: req.params.minion_name,
      minion_description: req.params.minion_description,
      minion_type: req.params.minion_type,
      minion_moveID1: req.params.minion_moveID1,
      minion_moveAlias1: req.params.minion_moveAlias1,
      minion_moveID1: req.params.minion_moveID2,
      minion_moveAlias1: req.params.minion_moveAlias2,
      minion_moveID1: req.params.minion_moveID3,
      minion_moveAlias1: req.params.minion_moveAlias3,
      minion_moveID1: req.params.minion_moveID4,
      minion_moveAlias1: req.params.minion_moveAlias4,
      minion_stat_strength: req.params.minion_stat_strength,
      minion_stat_intelligence: req.params.minion_stat_intelligence,
      minion_stat_dexterity: req.params.minion_stat_dexterity,
      minion_stat_speed: req.params.minion_stat_speed,
      minion_stat_health: req.params.minion_stat_health,
      minion_stat_coffeemaking: req.params.minion_stat_coffeemaking,
    };

    console.log("Capturing minion:\n%j", obj);

    collection.insert(
      obj,
      function(err, count) {
        if (err) {
          console.log('ERR_capture_3');
          res.json({success:false});
          throw err;
        }

        console.log('Minion captured.');
        res.json({success:true});
      }
    );
  });
});


app.listen(6699);
console.log("Gauntlet server listening on 6699!");

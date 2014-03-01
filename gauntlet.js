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
      throw err;
    }

    //TODO: verify values sum to 17 and that type is one of the four valid types.

    var obj =   {
      date: Math.round(new Date().getTime() / 1000),
      username: req.params.username,
      minion_picture: req.params.minion_picture,
      minion_name: req.params.minion_name,
      minion_description: req.params.minion_description,
      minion_type: req.params.minion_type,
      minion_moveID1: req.params.minion_moveID1,
      minion_moveAlias1: req.params.minion_moveAlias1,
      minion_moveID2: req.params.minion_moveID2,
      minion_moveAlias2: req.params.minion_moveAlias2,
      minion_moveID3: req.params.minion_moveID3,
      minion_moveAlias3: req.params.minion_moveAlias3,
      minion_moveID4: req.params.minion_moveID4,
      minion_moveAlias4: req.params.minion_moveAlias4,
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
        res.json({success:true, "_id":obj._id});
      }
    );
  });
});

function getMinionFromID(minionID) {
  console.log("Attempting get minion from ID...");

  db.collection('minions', function(err, collection) {
    if (err) {
      console.log("ERR_mget_1");
      throw err;
    }

    collection.find({_id: new ObjectId(minionID)},{}, function(err, cursor) {
      if (err) {
        console.log("ERR_mget_2");
        throw err;
      }

      cursor.toArray(function(err, documents) {
        if (err) {
          console.log("ERR_mget3");
          throw err;
        }
        console.log("Returning looked-up minion:\n%j", documents[0]);
        return documents[0];
      });
    });
  });
}

/**
 * Start a battle!
 */
app.get('/gauntlet/battle/start/:auth/:username/:targetUsername/:yourMinionID/:targetMinionID', function(req, res) {
  console.log("Starting a battle...");
  if (!checkToken(req.params.auth, req.params.username)) {
    res.json({success:false});
    return false;
  }

  db.collection('battles', function(err, collection) {
    if (err) {
      console.log("ERR_startbattle_1");
      res.json({success:false});
      throw err;
    }

    var hostMinion = getMinionFromID(req.params.yourMinionID);
    var guestMinion = getMinionFromID(req.params.targetMinionID);

    var obj = {
      host: req.params.username,
      guest: req.params.targetUsername,
      minionHost: hostMinion,
      minionGuest: guestMinion,
      hostTurn: true,
      active: true,
      hostHealth: hostMinion.minion_stat_health * 10,
      guestHealth: guestMinion.minion_stat_health * 10,
      lastMoveName: '?',
      lastDamage: 0,
    }

    console.log("Creating battle state:\n%j", obj);

    collection.insert(
      obj,
      function(err, count) {
        if (err) {
          console.log('ERR_startbattle_2');
          res.json({success:false});
          throw err;
        }

        console.log('Battle state created.');
        res.json({success:true});
      }
    );
  });
});

/**
 * List battles you're involved in.
 */
app.get('/gauntlet/battle/list/:auth/:username', function(req, res) {
  console.log("Starting to list battles for " + req.params.username);
  if (!checkToken(req.params.auth, req.params.username)) {
    res.json({success:false});
    return false;
  }


  db.collection('battles', function(err, collection) {
    if (err) {
      console.log("ERR_listbattle_1");
      res.json({success:false});
      throw err;
    }

    //find any battles in which we are involved.
    collection.find({$or:[{host:req.params.username},{guest:req.params.username}]},{}, function(err, cursor) {
      if (err) {
        console.log("ERR_listbattle_2");
        throw err;
      }

      cursor.toArray(function(err, documents) {
        if (err) {
          console.log("ERR_listbattle_3");
          throw err;
        }
        console.log("Returning looked-up battles:\n%j", documents);
        res.json(documents);
      });
    });


  });
});


function getBattleFromID(battleID) {
  console.log("Attempting get battle from ID...");

  db.collection('battles', function(err, collection) {
    if (err) {
      console.log("ERR_bget_1");
      throw err;
    }

    collection.find({_id: new ObjectId(battleID)},{}, function(err, cursor) {
      if (err) {
        console.log("ERR_bget_2");
        throw err;
      }

      cursor.toArray(function(err, documents) {
        if (err) {
          console.log("ERR_bget3");
          throw err;
        }
        if (documents == null)
          return null;

        console.log("Returning looked-up battle:\n%j", documents[0]);
        return documents[0];
      });
    });
  });
}

/**
 * move coefficients for strength, intelligence dexterity, coffeemaking, speed
 * and health respectively
 */
var moveStatLUT = [
  [3, 0, 0, 0, 2, 0],
  [3, 0, 2, 0, 0, 0],
  [0, 1, 0, 0, 4, 0],
  [1, 4, 0, 0, 0, 0],
  [4, 0, 0, 4, 0, 1],
  [5, 0, 0, 0, 0, 0],
  [0, 0, 4, 0, 4, 1],
  [0, 0, 0, 0, 5, 0],
  [0, 4, 3, 0, 0, 0],
  [0, 7, 0, 0, 0, 0],
  [0, 6, 0, 0, 1, 0],
  [0, 0, 0, 5, 4, 2],
  [0, 7, 2, 0, 0, 2],
  [0, 0, 0, 0, 7, 2],
  [0, 0, 0, 7, 0, 0],
  [0, 3, 0, 3, 0, 0],
  [3, 0, 5, 0, 0, 1],
  [0, 2, 0, 0, 4, 0],
  [0, 0, 0, 0, 6, 0],
  [0, 1, 5, 0, 0, 0],
  [2, 0, 0, 0, 4, 0],
  [0, 0, 6, 0, 0, 0],
  [0, 0, 7, 0, 1, 2],
  [0, 0, 0, 5, 0, 1],
  [2, 0, 0, 3, 0, 1],
  [0, 3, 0, 2, 0, 0],
  [0, 0, 1, 4, 0, 0],
  [0, 0, 0, 3, 2, 0],
  [2, 0, 0, 4, 0, 0],
  [0, 0, 0, 0, 4, 0],
  [0, 0, 0, 0, 5, 1]
];

function maxx(a, b) {
  if (a > b)
    return a;
  return b;
}

function dotProduct(vec1, vec2) {
  var ret;
  for (var i = 0; i < vec1.length; i++) {
    ret += vec1[i] * vec2[i];
  }
  return ret;
}
/**
 * Damage is a function of the move's values multiplied by the sender's corresponding
 * stats for the move's values, all added together (dot product), minus half the
 * target's same dot product. Then, multiplied by 2 or 0.5 based on the triangle bonuses.
 */
function getDamageValue(moveID, sender, target) {
  var dmg = dotProduct([sender.minion_stat_strength, sender.minion_stat_intelligence, sender.minion_stat_dexterity, sender.minion_stat_coffeemaking, sender.minion_stat_speed, sender.minion_stat_health], moveStatLUT[moveID]);
  var mit = dotProduct([target.minion_stat_strength, target.minion_stat_intelligence, target.minion_stat_dexterity, target.minion_stat_coffeemaking, target.minion_stat_speed, target.minion_stat_health], moveStatLUT[moveID]);
  var mult = (target.minion_type == sender.minion_type) ? 1 :
  (target.minion_type == "Intern") ? 2 :
  (target.minion_type == "Ranger") ? ((sender.minion_type == "Mage") ? 0.5 : 2) :
  (sender.minion_type == "Ranger") ? 0.5 : 2;

  return maxx((dmg * mult) - mit, 0);
  }


/**
 * A player makes a move. This needs to update active and HPs and switch the turn at a minium.
 */
app.get('/gauntlet/battle/move/:auth/:username/:battleID/:move', function(req, res) {
  console.log("Player attempting to make move " + req.params.username);
  if (!checkToken(req.params.auth, req.params.username)) {
    res.json({success:false});
    return false;
  }

  db.collection('battles', function (err, collection) {
    if (err) {
      console.log("ERR_move_1");
      res.json({success:false});
      throw err;
    }

    //get the battle state
    var battle = getBattleFromID(req.params.battleID);
    if (battle == null)
      {
        console.log("Null battle state............");
        res.json({success:false});
        return;
      }

    //make sure it's our turn...
    if (((battle.hostTurn == true) && (req.params.username != battle.host)) || ((battle.hostTurn == false) && (req.params.username != battle.guest))) {
      //Does this look liike your turn? are you fscking sorry?!
      console.log("wait yer turn");
      res.json({success:false});
      return;
    }

    if (!battle.active) {
    //stop trying to make this battle happen it's not going to happen
      console.log("get out");
      res.json({success:false});
      return;
    }

    var moveInternalID;

    switch (req.params.move) {
      case 1:
        moveInternalID = battle.hostTurn ? battle.host.minion_moveID1 : battle.guest.minion_moveID1;
        battle.lastMoveName = battle.hostTurn ? battle.host.minion_moveAlias1 : battle.guest.minion_moveAlias1;
        break;
      case 2:
              moveInternalID = battle.hostTurn ? battle.host.minion_moveID2 : battle.guest.minion_moveID2;
        battle.lastMoveName = battle.hostTurn ? battle.host.minion_moveAlias2 : battle.guest.minion_moveAlias2;
        break;
      case 3:
              moveInternalID = battle.hostTurn ? battle.host.minion_moveID3 : battle.guest.minion_moveID3;
        battle.lastMoveName = battle.hostTurn ? battle.host.minion_moveAlias3 : battle.guest.minion_moveAlias3;
        break;
      case 4:
              moveInternalID = battle.hostTurn ? battle.host.minion_moveID4 : battle.guest.minion_moveID4;
        battle.lastMoveName = battle.hostTurn ? battle.host.minion_moveAlias4 : battle.guest.minion_moveAlias4;
        break;
      default:
        console.log("that's not a valid number 1 through 4");
        res.json({success:false});
        return;
    }

    var lstDmg;
    //Ok go, update the health and re-write the state!
    if (battle.hostTurn) {
      lstDmg = getDamageValue(moveInternalID, host, target);
      console.log("host attacked for " + lstDmg);
      battle.guestHealth -= lstDmg;
      if (guestHealth <= 0)
        battle.active = false;
    }else {
      lstDmg = getDamageValue(moveInternalID, target, host);
      console.log("guest attacked for " + lastDmg);
      battle.hostHealth -= lstDmg;
      if (hostHealth <= 0)
        battle.active = false;
    }

    battle.lastDamage = lstDmg;


    collection.update({_id: new ObjectId(req.params.batleID)}, battle, function (err, count) {
      if (err) {
        res.json({success:false});
        throw err;
      }
      res.json({success:true});
    });

  });
});


app.listen(6699);
console.log("Gauntlet server listening on 6699!");

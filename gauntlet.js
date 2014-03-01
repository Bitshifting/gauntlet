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

  db.collection('accounts', function(err, collection) {
    if (err) {
      res.json({success:false});
      throw err;
    }

    console.log('Attempting to create account "' + req.params.username + '"...\n\t');

    //Check if the username already exists...
    collection.find({username : req.params.username}, {}, function(err, cursor) {
      if (err) {
        res.json({success:false});
        throw err;
      }

      cursor.count(function(err, count) {
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
 */
app.get('/gauntlet/account/authenticate/:username/:passwordhash', function(req, res) {
  db.collection('accounts', function(err, collection) {
    if (err) {
      res.json({success:false});
      throw err;
    }

    collection.find({username:req.params.username, passwordhash: req.params.passwordhash}, function(err, cursor) {
      cursor.count(function(err, count) {
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
function checkAuth(token, user) {
  db.collection('accounts', function(err, collection) {
    if (err) {
      res.json({success:false});
      throw err;
    }

    collection.find({username: user, _id: token}, {}, function(err, cursor) {
      cursor.count(function(err, count) {
        if (count == 0)
          return false;
        return true;
      });
    });
  });
}




app.listen(6699);
console.log("gauntlet server listening on 6699");

gauntlet
========

The ultimate showdown! Collect minions, train them, level them, trade them, battle them!

API Endpoints at (you know the URI .alexkersten.com) port 6699

# API Detail

## Account functionality

### `/gauntlet/account/register/:username/:passwordhash`

Register a user account. If the account already exists, returns false.

Response like `{"success":true}`

### `/gauntlet/account/authenticate/:username/:passwordhash`

Logs in to a user account and responds with an authentication token which you'll need to use in every request.

Response like `{"success":true,"auth":"1234567890abcdef"}`

## Minions

### `/gauntlet/minions/list/:auth/:username`

Returns a list of collected minions (with all attributes) belonging to your user account (inferred from auth token). Username field is ingored but could be used for future use if you"re listing someone else"s collection.

Response like `{"success":true,"minions":[{<SEE MINION OBJECT SPECIFICATION>},]}`

### `/gauntlet/minions/capture/:auth/:username/:minion_picture/:minion_name/:minon_description/:minion_type/:minion_moveID1/:minion_moveAlias1/:minion_moveID2/:minion_moveAlias2/:minion_moveID3/:minion_moveAlias3/:minion_moveID4/:minion_moveAlias4/:minion_stat_strength/:minion_stat_intelligence/:minion_stat_dexterity/:minion_stat_speed/:minion_stat_health/:minion_stat_coffeemaking`

Capture a minion for `username`! This should be you (it'll fail otherwise if your auth token is wrong). The implementing application should provide values for the following fields:

* `minion_name` : The name of the minion (to be shown to other users).
* `minion_picture` : A direct link to a JPG or PNG somewhere to represent the minion. Will probably be Imgur, but whatever.
* `minion_description` : A short bio about this minion. For example, where its natural habitat is, what foods it likes to eat, etc.
* `minion_type` : The class of minion, one of `{Warrior, Ranger, Mage, Intern}`
* `minion_MoveIDx` : One of four moves to assign to the minion (replace x with a number [1,4]) - this is the internal ID of the base move, since the user can re-name the moves with...
* `minion_moveAliasx` : The alias of move x, to be displayed when the move is used.
* `minion_stat_strength` : Initial strength for minion - these must add up to 17 (base 12 + 5 first assign)
* `minion_stat_intelligence`
* `minion_stat_dexterity`
* `minion_stat_speed`
* `minion_stat_health`
* `minion_stat_coffeemaking`

The server then replies with a minion object (specified below).

Response like `{"success":true,"minion":{<SEE MINION OBJECT SPECIFICATION>}}`

### Minion Object

The following object represents a minion and will be returned.

`{`
`"minion_name":"name",`
`"minion_picture":"http://your.face",`
`"minion_description":"Some biography about this minion",`
`"minion_type":"Warrior" or "Ranger" or "Mage" or "Intern",`
`"minion_moveIDx":2`
`"minion_moveAliasx":"Name of this move (keep in mind there are 4 of these)",`
`"minion_stat_strength":5,`
`"minion_stat_intelligence":5,`
`"minion_stat_dexterity":5,`
`"minion_stat_speed":5,`
`"minion_stat_health":5,`
`"minion_stat_coffeemaking":5,`
`"minion_stat_level":5,`
`"minion_stat_experience":5,`
`}`


### Move IDs

The following IDs map to the following base moves.

//TODO

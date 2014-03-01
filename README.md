gauntlet
========

The ultimate showdown! Collect minions, train them, level them, trade them, battle them!

API Endpoints at (you know the URI .alexkersten.com) port 6699

# API Detail

## Accounts

### `/gauntlet/account/register/:username/:passwordhash`

Register a user account. If the account already exists, returns false.

Response like `{"success":true}`

### `/gauntlet/account/authenticate/:username/:passwordhash`

Logs in to a user account and responds with an authentication token which you'll need to use in every request.

Response like `{"success":true,"auth":"1234567890abcdef"}`

## Minions

### `/gauntlet/minions/list/:auth/:username`

Returns a list of collected minions (with all attributes) belonging to `username`.

Response like `[{<SEE MINION OBJECT SPECIFICATION>},]`

### `/gauntlet/minions/capture/:auth/:username/:minion_picture/:minion_name/:minon_description/:minion_type/:minion_moveID1/:minion_moveAlias1/:minion_moveID2/:minion_moveAlias2/:minion_moveID3/:minion_moveAlias3/:minion_moveID4/:minion_moveAlias4/:minion_stat_strength/:minion_stat_intelligence/:minion_stat_dexterity/:minion_stat_speed/:minion_stat_health/:minion_stat_coffeemaking`

Capture a minion for `username`! This should be you (it'll fail otherwise if your auth token is wrong). The implementing application should provide values for the following fields:

* `date` : When this minion was captured (unix timestamp)
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

Response like `{"success":true, "_id":"abc1234"}`

### Minion Object

The following object represents a minion and will be returned.

`{`
`"_id":"1234abc",
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

The following IDs map to the following base moves. (TODO: For now look at the google doc)

## Battles

A battle is a conflict between one of your minions and another minion. You can create a battle at any time and a minion can be in multiple battles at once (all separate 'instances' of the minion - health, etc. is tracked per battle instance and multiple of them can be going on at once with the same base minion, you don't have to heal your minions, etc.) This should make it more social if you want one of your minions to fight two different friends' minions in about the same timeframe.

### `/gauntlet/battle/start/:auth/:username/:targetUsername/:yourMinionID/:targetMinionID`

Whoever starts a battle goes first. Should use /minions/list on the opponent to find the minionID that you want to fight, and then name both it and the ID of one of your own minions to battle.

These battles will be visible when you do a /battle/list and the server will keep track of the state of health, turn order, etc. in a particular battle - but any involved minions will not be preoccupied (they can do multiple battles at once as separate instances).

Response like `{"success":true}`

### `/gauntlet/battle/list/:auth/:username`

Returns a list of battles for this user, where each entry in the list has a battle ID and the objects of the involved minions, as well as the turn state. **You should poll this periodically to check if you have any battle requests and then have user input which triggers calls to other API requests for battle**. if `active` then both minions are still alive.

Response like `[{"_id":"1234","host":"name1","guest":"name2",hostMinion":{minion object},"guestMinion":{minion object},"hostTurn":false,"active":true,"hostHealth":10,"guestHealth":10,"lastMoveName":"someName", "lastDamage":234},]`

### `/gauntlet/battle/move/:auth/:username/:battleID/:move`

Performs `move` in the ongoing battle `battleID` presuming it is your turn. `move` is a number 1-4 (of the moves that your minion knows).

Doing this will update the state of the battle. Poll battle/list to see any new damage, etc.

Invoking this can cause a battle to end (opponent or you die, etc). In this case, the battle becomes inactive and the client can determine if it won by looking at enemy health vs your health - inactive battles are still returned in the battle/list call, and can be displayed by clients like an archive/history.

Response like `{"success":true}`




//TODO

gauntlet
========

The ultimate showdown! Collect minions, train them, level them, trade them, battle them!

# API Detail

## Account functionality

### `/gauntlet/account/register/:username/:passwordhash/`

Register a user account. If the account already exists, returns false.

Response like `{"success":true}`

### `/gauntlet/account/authenticate/:username/:passwordhash`

Logs in to a user account and responds with an authentication token which you'll need to use in every request.

Response like `{"success":true,"auth":"1234567890abcdef"}`

## Minions

### `/gauntlet/minions/list/:auth/:username`

Returns a list of collected minions (with all attributes) belonging to your user account (inferred from auth token). Username field is ingored but could be used for future use if you"re listing someone else"s collection.

Response like `{"success":true,"minions":[{<SEE MINION FIELD SPECIFICATION BELOW>},]}

### `/gauntlet/minions/capture/:auth/:username/:minion_picture/:minion_name/`

Capture a minion for `username`! This should be you (it'll fail otherwise if your auth token is wrong). User provides the name of the minion in `minion_name`, and also a link to the minion's picture (probably on Imgur) in `minion_picture`. Whatever implementing app is interfacing with this API is responsible for doing this.

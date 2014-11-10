var argv =  require('optimist')
            .usage('Usage: $0 --in [file]')
            .demand(['in'])
            .argv;

var similarUsers = require('./module/similarUsers.js');
var similarTweets = require('./module/similarTweets.js');
var jf =    require('jsonfile');
var oData,
    simU,
    simT;

//read file
oData = jf.readFileSync(argv.in); 

// console.log("Create model for users");
// simU = similarUsers(oData);

console.log("Create model for tweets");
simT = similarTweets(oData);

console.log(simT.getTopNTweet("Vihar közeleg... #vihar #Szalánta http://t.co/dzvYRT73sD", 5));

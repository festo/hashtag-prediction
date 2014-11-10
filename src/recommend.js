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

console.log(simT.getTopNTweet("RT @liverbirdynwa: meg mindig Help! Kellene egy profi hedszett szombatra Nokia E51-hez. #help pls Rt.", 5));

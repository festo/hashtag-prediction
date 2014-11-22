var argv            =  require('optimist')
                        .usage('Usage: $0 --in [file]')
                        .demand(['in'])
                        .argv;

var similarUsers    = require('./module/similarUsers.js');
var similarTweets   = require('./module/similarTweets.js');
var freq            = require('./module/hashtagFrequency.js');
var jf              = require('jsonfile');
var _               = require('underscore');

var oData,
    oUserModell,
    oTweetModell,
    oFreqModell,
    aRecomendedTags = [],
    aTagHelper;

//read file
oData = jf.readFileSync(argv.in); 

console.log("Create model for users");
oUserModell = similarUsers(oData);
console.log("Create model for tweets");
oTweetModell = similarTweets(oData);
console.log('Calculate frequency');
oFreqModell = freq(oData);

// aTagHelper = oUserModell.getTopNUser(97974643, 5);
// _.each(aTagHelper, function(nUser) {
//     var aHashTags = oUserModell.getHashtagsByUser(nUser);
//     _.each(aHashTags, function(sKey) {
//         aRecomendedTags.push([sKey, oFreqModell.getfrequency(sKey)]);
//     });
// });

aTagHelper = oTweetModell.getTopNTweet("RT @liverbirdynwa: meg mindig Help! Kellene egy profi hedszett szombatra Nokia E51-hez. #help pls Rt.", 5);
_.each(aTagHelper, function(aTweetTag) {
    var aHashTags = aTweetTag[1];
    _.each(aHashTags, function(sKey) {
        aRecomendedTags.push([sKey, oFreqModell.getfrequency(sKey)]);
    });
});

aRecomendedTags.sort(function(a, b) {
    if (a[1] < b[1]) return -1;
    if (a[1] > b[1]) return 1;
    return 0;
});

aTagHelper = [];
_.each(aRecomendedTags, function(aTag) {
    aTagHelper.push(aTag[0]);
});
aRecomendedTags = _.unique(aTagHelper);

console.log('-- aRecomendedTags --');
console.log(aRecomendedTags);
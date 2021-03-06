var argv            =  require('optimist')
                        .usage('Usage: $0 --train [file] -u [number of similar users] -y [number of similar tweets] --test [file]')
                        .default('u', 0)
                        .default('y', 0)                        
                        .demand(['train', 'test'])
                        .argv;

var similarUsers    = require('./module/similarUsers.js');
var similarTweets   = require('./module/similarTweets.js');
var freq            = require('./module/hashtagFrequency.js');
var jf              = require('jsonfile');
var _               = require('underscore');

var oTrainData,
    oTestData,
    oUserModell,
    oTweetModell,
    oFreqModell;

//read file
oTrainData = jf.readFileSync(argv.train); 
oTestData = jf.readFileSync(argv.test); 

console.log("Create model for users");
oUserModell = similarUsers(oTrainData);
console.log("Create model for tweets");
oTweetModell = similarTweets(oTrainData);
console.log('Calculate frequency');
oFreqModell = freq(oTrainData);

function getTags(nUser, sTweet) {
    var aRecomendedTags = [],
        aTagHelper;

    aTagHelper = oUserModell.getTopNUser(nUser, argv.u);
    _.each(aTagHelper, function(nUser) {
        var aHashTags = oUserModell.getHashtagsByUser(nUser);
        _.each(aHashTags, function(sKey) {
            aRecomendedTags.push([sKey, oFreqModell.getfrequency(sKey)]);
        });
    });

    aTagHelper = oTweetModell.getTopNTweet(sTweet, argv.y);
    _.each(aTagHelper, function(aTweetTag) {
        var aHashTags = aTweetTag[1];
        _.each(aHashTags, function(sKey) {
            aRecomendedTags.push([sKey, oFreqModell.getfrequency(sKey)]);
        });
    });

    // split under the most N frequented tag
    aRecomendedTags.sort(function(a, b) {
        if (a[1] < b[1]) return -1;
        if (a[1] > b[1]) return 1;
        return 0;
    });

    aRecomendedTags = _.unique(aRecomendedTags);

    aTagHelper = [];
    _.each(aRecomendedTags, function(aTag) {
        aTagHelper.push(aTag[0]);
    });

    aTagHelper = aTagHelper.splice(0, 5);

    return aTagHelper;
}

var nSuccess = 0;
var recCounter = 0;

_.each(oTestData, function(oTweet) {
    var aSuggested,
        bMatch = false;

    recCounter++;    
    console.log('=============== '+ recCounter +' =====================');
    console.log('Original tweet: ' + oTweet.text);
    console.log('Tags: ' + oTweet.tags.join(', '));
    aSuggested = getTags(oTweet.user, oTweet.text);
    console.log('Suggested: ' + aSuggested.join(', '));
    console.log('Matched:');
    _.each(oTweet.tags, function(sTag) {
        if(aSuggested.indexOf(sTag) > -1) {
            // bMatch = true;
            nSuccess++;
            console.log(sTag);
        }
    });

    // if(bMatch) {
    //     nSuccess++;
    // }
});

console.log('============ END ===============');
console.log('Matched teweets: %s', nSuccess);
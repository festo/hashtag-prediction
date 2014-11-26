var argv =  require('optimist')
            .usage('Usage: $0 --in [file]')
            .demand(['in'])
            .argv;

var _ =     require('underscore');
var jf =    require('jsonfile');
var moment = require('moment');

// Global variables
var aData,
    aWithHashtag = [],
    oTweetCountByUser = {},
    oDate = {
        min: 9999999999999,
        max: 0
    },
    oHashtags = {};

//read file
aData = jf.readFileSync(argv.in); 

_.each(aData, function(oTweet) {
    if(oTweet.tags.length !== 0) {
        aWithHashtag.push(oTweet);
        oDate.min = Math.min(oTweet.date, oDate.min);
        oDate.max = Math.max(oTweet.date, oDate.max);
    }
});

console.log("Tweets with hashtags: " + aWithHashtag.length);
console.log("First: " + moment(oDate.min).format("YYYY-MM-DD HH:MM"));
console.log("Last: " + moment(oDate.max).format("YYYY-MM-DD HH:MM"));

_.each(aWithHashtag, function(oTweet) {
    if(oTweet.user in oTweetCountByUser) {
        oTweetCountByUser[oTweet.user]++;
    } else {
        oTweetCountByUser[oTweet.user] = 1;        
    }
});

var aSortable = [];
_.each(oTweetCountByUser, function(value, key) {
    aSortable.push([key, oTweetCountByUser[key]])
});
aSortable.sort(function(a, b) {return b[1] - a[1]});


console.log("\nUnique user: " + aSortable.length);
console.log("User id, tweet count");
console.log("-------------------------------------\n");

_.each(aSortable, function(aCount) {
    console.log(aCount[0] + ", " + aCount[1]);
});

// count hashtags
_.each(aWithHashtag, function(oTweet) {
    if(oTweet.tags.length !== 0) {
        _.each(oTweet.tags, function(sTag) {
            // sTag = sTag.replace(/á/g, 'a')
            //             .replace(/é/g, 'e')
            //             .replace(/í/g, 'i')
            //             .replace(/ó/g, 'o')
            //             .replace(/ö/g, 'o')
            //             .replace(/ő/g, 'o')
            //             .replace(/ú/g, 'u')
            //             .replace(/ü/g, 'ü')
            //             .replace(/ű/g, 'u');
            if(sTag in oHashtags) {
                oHashtags[sTag]++;
            } else {
                oHashtags[sTag] = 1;
            }
        });
    }
});

aSortable = [];
_.each(oHashtags, function(value, key) {
    aSortable.push([key, oHashtags[key]])
});
aSortable.sort(function(a, b) {
    var ret = 0;
    if (a[0] < b[0]) ret = -1;
    if (a[0] > b[0]) ret = 1;

    // if(ret === 0) {
    //     if (a[0] < b[0]) ret = -1;
    //     if (a[0] > b[0]) ret = 1;
    // }
    return ret;
});

console.log("\nUnique hastags: " + aSortable.length);
console.log("Hastag, count");
console.log("-------------------------------------");
_.each(aSortable, function(aCount) {
    console.log(aCount[0] + ", " + aCount[1]);
});

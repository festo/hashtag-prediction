var _           = require('underscore');
var math        = require('mathjs');
var natural     = require('natural');
var Sparse      = require('./sparse.js');
var tokenizer   = new natural.WordTokenizer();

var similarUsers = function(data) {
    var Module = {},
    oTweets = {},
    aUniqueWords = [],
    oTweetsWeight = {},
    oTokens = {},
    oWordCountByTweets = {},
    aUnknownTweetWeight = new Sparse(),
    nTweetCount = 0;

    Module.freq = function(sWord, sTweet) {
        var aTokens;

        if(sTweet in oTokens) {
            aTokens = oTokens[sTweet];
        } else {
            aTokens = tokenizer.tokenize(sTweet);
        }

        return _.filter(aTokens, function(sWordFilter) {
            return sWordFilter === sWord;
        }).length;
    };

    Module.max = function(sTweet) {
        var aTokens;
        if(sTweet in oTokens) {
            aTokens = oTokens[sTweet];
        } else {
            aTokens = tokenizer.tokenize(sTweet);
        }
        return aTokens.length;
    };

    Module.TF = function(sWord, sTweet) {
        return Module.freq(sWord, sTweet) / Module.max(sTweet)
    };

    Module.IDF = function(sWord) {
        var n = Module.n(sWord);

        if(n === 0) {
            return nTweetCount;
        } else {
            return Math.log( nTweetCount / Module.n(sWord) );
        }        
    };

    Module.w = function(sTweet, sWord) {
        return  Module.TF(sWord, sTweet) * Module.IDF(sWord);
    };

    Module.n = function(sWord) {
        if(sWord in oWordCountByTweets) {
            return oWordCountByTweets[sWord];
        }

        var nCount = 0;
        _.each(oTweets, function(oTweet){
            if(_.indexOf(oTokens[oTweet.text], sWord) > -1) {
                nCount++;
            }
        });
        oWordCountByTweets[sWord] = nCount;

        return oWordCountByTweets[sWord];       
    };


    Module.Sim = function(sTweetUnknow, sTweetKnow) {
        var nCounter = 0, 
            aKnownTweetWeight = new Sparse();

        if(aUnknownTweetWeight.getLength() === 0) {
            aUnknownTweetWeight = Module.getTweetWeights(sTweetUnknow);
        }

        aKnownTweetWeight = Module.getTweetWeights(sTweetKnow);    

        for(var i = 0; i < aUnknownTweetWeight.getLength(); i++) {
            nCounter += aUnknownTweetWeight.get(i) * aKnownTweetWeight.get(i);
        }

        return nCounter / ( math.norm(aUnknownTweetWeight.toArray()) * math.norm(aKnownTweetWeight.toArray()) );
    };

    Module.getTopNTweet = function(sTweetUnknow, N) {
        var aReturnValue = [],
            nCounter = 0,
            aAllTweetSimilarity = [];

        _.each(oTweets, function(value, sTweet){
            if(sTweet !== sTweetUnknow) {

                process.stdout.clearLine();  // clear current text
                process.stdout.cursorTo(0);
                process.stdout.write("Similar tweets: " + (++nCounter));

                aAllTweetSimilarity.push([sTweet, Module.Sim(sTweet, sTweet)]);
            }
        });        

        aAllTweetSimilarity = _.sortBy(aAllTweetSimilarity, function(item) {
            return item[1];
        });

        console.log('\nSelect top ' + N);
        for (var i = aAllTweetSimilarity.length - 1; i >= (aAllTweetSimilarity.length -N); i--) {
            aReturnValue.push([aAllTweetSimilarity[i][0], oTweets[aAllTweetSimilarity[i][0]].tags]);
        };

        return aReturnValue;
    };

    Module.getTweetWeights = function(sTweet) {
        var aWeight = new Sparse();
        _.each(aUniqueWords, function(sWord) {
            aWeight.push(Module.w(sTweet, sWord));
        })
        return aWeight;
    };


    // init
    _.each(data, function(oTweet) {
        if(oTweet.tags.length !== 0) {  // select only tweets what has got tags

            process.stdout.clearLine();  // clear current text
            process.stdout.cursorTo(0);
            process.stdout.write("Tokenize tweets: " + (++nTweetCount));

            var aTokens = tokenizer.tokenize(oTweet.text);

            if(!(oTweet.text in oTokens)) {                        
                oTokens[oTweet.text] = aTokens;
            }

            for (var i = 0; i < aTokens.length; i++) {
                aUniqueWords.push(aTokens[i]);
            };

            oTweets[oTweet.text] = oTweet;
        }
    });

    aUniqueWords = _.unique(aUniqueWords);

    console.log('\nUnique word: '+aUniqueWords.length);

    console.log('Calculate number of words by tweets ...');
    var i = 0;
    _.each(aUniqueWords, function(sWord) {
        process.stdout.clearLine();  // clear current text
        process.stdout.cursorTo(0);
        process.stdout.write('' + (++i));
        Module.n(sWord);
    });
    console.log('');
    
    return Module;
}

module.exports = similarUsers;

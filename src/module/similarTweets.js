var _           = require('underscore');
var math        = require('mathjs');
var natural     = require('natural');
var Sparse      = require('./sparse.js');
var tokenizer   = new natural.WordTokenizer(),
    TfIdf = natural.TfIdf,
    tfidf = new TfIdf();

var similarUsers = function(data) {
    var Module = {},
    oTweets = {},
    aUniqueWords = [],
    oTweetsWeight = {},
    oTweetsWeightNorm = {},
    oTokens = {},
    oWordCountByTweets = {},
    nTweetCount = 0;

var index = 0;


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
            if(nTweetCount / Module.n(sWord) === 0) {
                return 0;
            }
            return Math.log( nTweetCount / Module.n(sWord) );
        }        
    };

    Module.w = function(sTweet, sWord) {
        // console.log("W: " + oTweets[sTweet].id);
        return tfidf.tfidf(sWord, oTweets[sTweet].id);
        // return  Module.TF(sWord, sTweet) * Module.IDF(sWord);
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
            aKnownTweetWeight,
            aUnknownTweetWeight,


        aUnknownTweetWeight = Module.getTweetWeights(sTweetUnknow);
    
        // console.log("");
        // console.log(aUnknownTweetWeight.toString().length);

        aKnownTweetWeight = Module.getTweetWeights(sTweetKnow);    

        for(var i = 0; i < aUnknownTweetWeight.getLength(); i++) {
            nCounter += aUnknownTweetWeight.get(i) * aKnownTweetWeight.get(i);
        }

        var res = nCounter / (Module.getTweetWeightsNorm(sTweetUnknow) * Module.getTweetWeightsNorm(sTweetKnow));
        // if(res === 0) {
            // console.log("sTweetUnknow: %s", sTweetUnknow);
            // console.log("sTweetKnow: %s", sTweetKnow);
            // console.log("Counter %s", nCounter);
            // console.log("Norm1 %s", Module.getTweetWeightsNorm(sTweetUnknow));
            // console.log("Norm2 %s", Module.getTweetWeightsNorm(sTweetKnow));
        // }

        // var returnValue = (oTweetsWeightNorm[sTweetUnknow] * oTweetsWeightNorm[sTweetKnow]);
        // if(isNaN(returnValue) || isNaN(nCounter)) {
        //     return 0;
        // }

        return nCounter / (oTweetsWeightNorm[sTweetUnknow] * oTweetsWeightNorm[sTweetKnow]);
    };

    Module.getTopNTweet = function(sTweetUnknow, N) {
        var aReturnValue = [],
            nCounter = 0,
            aAllTweetSimilarity = [];

        tfidf.addDocument(sTweetUnknow, index);
        oTweets[sTweetUnknow] = {tetx: sTweetUnknow, id: index};
        index++;

        _.each(oTweets, function(value, sTweet){
            if(sTweet !== sTweetUnknow) {

                process.stdout.clearLine();  // clear current text
                process.stdout.cursorTo(0);
                process.stdout.write("Similar tweets: " + (++nCounter));

                aAllTweetSimilarity.push([sTweet, Module.Sim(sTweetUnknow, sTweet)]);
            }
        });        

        aAllTweetSimilarity = _.sortBy(aAllTweetSimilarity, function(item) {
            return item[1];
        });

        // console.log(aAllTweetSimilarity);

        console.log('\nSelect top ' + N);
        for (var i = aAllTweetSimilarity.length - 1; i >= (aAllTweetSimilarity.length -N); i--) {
            aReturnValue.push([aAllTweetSimilarity[i][0], oTweets[aAllTweetSimilarity[i][0]].tags]);
        };

        return aReturnValue;
    };

    Module.getTweetWeights = function(sTweet) {
        if(sTweet in oTweetsWeight) {
            return oTweetsWeight[sTweet];
        }

        var aWeight = new Sparse();
        _.each(aUniqueWords, function(sWord) {
            aWeight.push(Module.w(sTweet, sWord));
        });
        oTweetsWeight[sTweet] = aWeight;
        return oTweetsWeight[sTweet];
    };

    Module.getTweetWeightsNorm = function(sTweet) {
        if(sTweet in oTweetsWeightNorm) {
            return oTweetsWeightNorm[sTweet];
        }

        var aWeight = Module.getTweetWeights(sTweet);
        
        oTweetsWeightNorm[sTweet] = math.norm(aWeight.toArray());;
        return oTweetsWeightNorm[sTweet];
    };


    // init
    _.each(data, function(oTweet) {
        if(oTweet.tags.length !== 0) {  // select only tweets what has got tags

            process.stdout.clearLine();  // clear current text
            process.stdout.cursorTo(0);
            process.stdout.write("Tokenize tweets: " + (++nTweetCount));

            tfidf.addDocument(oTweet.text);

            var aTokens = tokenizer.tokenize(oTweet.text);

            // if(!(oTweet.text in oTokens)) {                        
            //     oTokens[oTweet.text] = aTokens;
            // }

            for (var i = 0; i < aTokens.length; i++) {
                aUniqueWords.push(aTokens[i]);
            };

            oTweet.id = index;
            index++;

            oTweets[oTweet.text] = oTweet;
        }
    });

    aUniqueWords = _.unique(aUniqueWords);

    console.log('\nUnique word: '+aUniqueWords.length);
    var i = 0;
    _.each(data, function(oTweet) {
            process.stdout.clearLine();  // clear current text
            process.stdout.cursorTo(0);
            process.stdout.write("Calculate TweetsWeight & norms: " + (++i));

            var aWeight = new Sparse();
            _.each(aUniqueWords, function(sWord) {
                aWeight.push(Module.w(oTweet.text, sWord));
            });
            oTweetsWeight[oTweet.text] = aWeight; 
            oTweetsWeightNorm[oTweet.text] = math.norm(aWeight.toArray());  
            // console.log("Array");
            // console.log(aWeight.toSting());
            // console.log(oTweetsWeightNorm[oTweet.text]);    
    });

    // console.log('Calculate number of words by tweets ...');
    // var i = 0;
    // _.each(aUniqueWords, function(sWord) {
    //     process.stdout.clearLine();  // clear current text
    //     process.stdout.cursorTo(0);
    //     process.stdout.write('' + (++i));
    //     Module.n(sWord);
    // });
    console.log('');
    
    return Module;
}

module.exports = similarUsers;

var _ =     require('underscore');
var math =     require('mathjs');
var natural = require('natural'),
    tokenizer = new natural.WordTokenizer();

var similarUsers = function(data) {
    var Module = {},
        oTweets = {},
        aWords = [],
        oTweetsWeight = {},
        oTokens = {},
        n_word = {},
        nMaxTweet = 0;
         

    Module.freq = function(word, tweet) {
        var aTokens;
        if(tweet in oTokens) {
            aTokens = oTokens[tweet];
        } else {
            aTokens = tokenizer.tokenize(tweet);
        }
       return _.filter(aTokens, function(sWord) {
            return sWord === word;
        }).length;
    };

    Module.max = function(tweet) {
        var aTokens;
        if(tweet in oTokens) {
            aTokens = oTokens[tweet];
        } else {
            aTokens = tokenizer.tokenize(tweet);
        }
        return aTokens.length;
    };

    Module.TF = function(word, tweet) {
        return Module.freq(word, tweet) / Module.max(tweet)
    };

    Module.IDF = function(word) {
        var n = Module.n(word);

        if(n === 0) {
            return nMaxTweet;
        } else {
            return Math.log( nMaxTweet / Module.n(word) );
        }        
    };

    Module.w = function(tweet, word) {
        var tf,
            idf;

        // console.log('Calc TF');
        tf = Module.TF(word, tweet);
        // console.log('Calc IDF');
        idf = Module.IDF(word);
        return  tf * idf;
    };

    Module.n = function(word) {
        if(word in n_word) {
            return n_word[word];
        }

        var count = 0;

        _.each(oTweets, function(oTweet){
            if(_.indexOf(oTweet.tokens), word) {
                count++;
            }
        });

        n_word[word] = count;
        return n_word[word];       
    };


    Module.Sim = function(tweet1, tweet2) {
        var counter = 0, 
            denominator = 0,
            t1,
            t2;


        // console.log('get weights for 1. tweet');
        t1 = Module.getTweetWeights(tweet1);
        // console.log('get weights for 2. tweet');
        t2 = Module.getTweetWeights(tweet2);    

        for(var i = 0; i < t1.length; i++) {
            counter += t1[i] * t2[i];
        }

        denominator = math.norm(t1) * math.norm(t2);

        return counter/denominator;
    };

    Module.getTopNTweet = function(sTweet, N) {
        var ret = [],
            counter = 0;
            all = [];

        _.each(oTweets, function(value, wteet_i){
            if(wteet_i !== sTweet) {

            process.stdout.clearLine();  // clear current text
            process.stdout.cursorTo(0);
            process.stdout.write("Similar tweets: " + (++counter));

                all.push([wteet_i, Module.Sim(sTweet, wteet_i)]);
            }
        });        
        console.log('');
        console.log('Sort ...');
        all = _.sortBy(all, function(item) {
            return item[1];
        });

        console.log('Select top ' + N);
        for (var i = all.length - 1; i >= (all.length -N); i--) {
            ret.push(all[i][0]);
        };

        return ret;
    };

    Module.getTweetWeights = function(sTweet) {
        if(sTweet in oTweetsWeight) {
            return oTweetsWeight[sTweet];
        } else {
            oTweetsWeight[sTweet] = [];
            _.each(aWords, function(sWord) {
                oTweetsWeight[sTweet].push(Module.w(sTweet, sWord));
            })
            return oTweetsWeight[sTweet];
        }
    };


    // init
    _.each(data, function(oTweet) {
        if(oTweet.tags.length !== 0) {
            process.stdout.clearLine();  // clear current text
            process.stdout.cursorTo(0);
            process.stdout.write("Tokenize tweets: " + (++nMaxTweet));

            oTweet.tokens = tokenizer.tokenize(oTweet.text);

            if(!(oTweet.text in oTokens)) {                        
                oTokens[oTweet.text] = oTweet.tokens;    
            }

            for (var i = 0; i < oTweet.tokens.length; i++) {
                aWords.push(oTweet.tokens[i]);
            };

            oTweets[oTweet.text] = oTweet;
        }
    });

    aWords = _.unique(aWords);

    console.log('\nUnique word: '+aWords.length);

    console.log('Calculate number tweets in which wl appears ...');
    var i = 0;
    _.each(aWords, function(word) {
        process.stdout.clearLine();  // clear current text
        process.stdout.cursorTo(0);
        process.stdout.write('' + (++i));
        Module.n(word);
    });
    console.log('');
    
    // End init  

    return Module;
}

module.exports = similarUsers;

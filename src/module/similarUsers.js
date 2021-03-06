var _       = require('underscore');
var math    = require('mathjs');
var Sparse      = require('./sparse.js');

var similarUsers = function(data) {
    var Module = {},
        aUsers = {},
        oHashtags = {},
        nMaxUser = 0,
        nMaxHashtag = 0,
        oUserWeightNorm = {},
        oUserWeight = {};  

    Module.freq = function(hashtag, user) {
        return _.filter(aUsers[user], function(sTag) {
            return sTag === hashtag;
        }).length;
    };

    Module.max = function(user) {
        return aUsers[user].length;    
    };

    Module.TF = function(hashtag, user) {
        return Module.freq(hashtag, user) / Module.max(user)
    };

    Module.IDF = function(hashtag) {
        return Math.log( nMaxUser / Module.n(hashtag) );
    };

    Module.w = function(hashtag, user) {
        return Module.TF(hashtag, user) * Module.IDF(hashtag);
    };

    Module.n = function(hashtag) {
        return oHashtags[hashtag].count;
    };

    Module.user = function(id) {
        return aUsers[id];
    };

    Module.Sim = function(nUnkwnowUser, user2) {

        if(!(nUnkwnowUser in oUserWeight)) {
            return 0;
        }

        var counter = 0, 
            denominator = 0;

        for(var i = 0; i < oUserWeight[nUnkwnowUser].getLength(); i++) {
            counter += oUserWeight[nUnkwnowUser].get(i) * oUserWeight[user2].get(i);
        }

        denominator = oUserWeightNorm[nUnkwnowUser] * oUserWeightNorm[user2];

        return counter/denominator;

    };

    Module.getTopNUser = function(user, N) {
        var ret = [],
            all = [];

        _.each(aUsers, function(value, user_i){
            if(user_i !== user) {
                all.push([user_i, Module.Sim(user, user_i)]);
            }
        });        

        all = _.sortBy(all, function(item) {
            return item[1];
        });

        for (var i = all.length - 1; i >= (all.length -N); i--) {
            var nSimilarity = all[i][1];

            if(nSimilarity > 0) {
                ret.push(all[i][0]);
            }            
        };
        return ret;
    };

    Module.getHashtagsByUser = function(user) {
        return _.unique(aUsers[user]);
    };

    _.each(data, function(oTweet) {
        if(oTweet.tags.length !== 0) {
            if(oTweet.user in aUsers) {
                _.each(oTweet.tags, function(sTag) {
                    aUsers[oTweet.user].push(sTag);
                })            
            } else {
                aUsers[oTweet.user] = oTweet.tags;  
                nMaxUser++;      
            }

            _.each(oTweet.tags, function(sTag) {
                if(!(sTag in oHashtags)) {
                    oHashtags[sTag] = {users: {}, count:0};
                    nMaxHashtag++;
                }

                if(!(oTweet.user in oHashtags[sTag].users)) {
                    oHashtags[sTag].users[oTweet.user] = {};
                    oHashtags[sTag].count++;
                } 
               
            });
        }        
    });

    _.each(aUsers, function(userValue, user) {
        oUserWeight[user] = new Sparse();
        _.each(oHashtags, function(hashtagValue, hashtag) {
            oUserWeight[user].push(Module.w(hashtag, user));
        })
        oUserWeightNorm[user] = math.norm(oUserWeight[user].toArray());
    })

    return Module;
}

module.exports = similarUsers;

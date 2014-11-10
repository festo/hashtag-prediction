var _ =     require('underscore');
var math =     require('mathjs');
var similarUsers = function(data) {
    var Module = {},
        aUsers = {},
        oHashtags = {},
        nMaxUser = 0,
        nMaxHashtag = 0,
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

    Module.Sim = function(user1, user2) {
        var counter = 0, 
            denominator = 0;

        for(var i = 0; i < oUserWeight[user1].length; i++) {
            counter += oUserWeight[user1][i] * oUserWeight[user2][i];
        }

        denominator = math.norm(oUserWeight[user1]) * math.norm(oUserWeight[user2]);

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
            ret.push(all[i][0]);
        };

        return ret;
    };

    Module.getHashtagsByUser = function(user) {
        return aUsers[user];
    };

        // init

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
        oUserWeight[user] = [];
        _.each(oHashtags, function(hashtagValue, hashtag) {
            oUserWeight[user].push(Module.w(hashtag, user));
        })
    })

    // console.log(nMaxHashtag);
    
    // End init  

    return Module;
}

module.exports = similarUsers;

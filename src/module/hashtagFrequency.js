var _ = require('underscore');

module.exports = function(aData) {
    var Module = {},
        oHashtags = {},
        oOrdered = {};

    _.each(aData, function(oTweet) {
        if(oTweet.tags.length > 0) {
            _.each(oTweet.tags, function(sTag) {                
                if(sTag in oHashtags) {
                    oHashtags[sTag]++;
                } else {
                    oHashtags[sTag] = 1;
                }
            });
        }
    });

    var aSortableHelper = [];
    _.each(oHashtags, function(value, key) {
        aSortableHelper.push([key, oHashtags[key]])
    });

    aSortableHelper.sort(function(a, b) {
        if (a[1] < b[1]) return 1;
        if (a[1] > b[1]) return -1;
        return 0;
    });

    var i = 0;
    _.each(aSortableHelper, function(sValue, nKey) {
        aSortableHelper[nKey]
    })

    for (var i = 0; i < aSortableHelper.length; i++) {
        var sKey = aSortableHelper[i][0];
        oOrdered[sKey] = i;
    };

    Module.getfrequency = function(sTag) {
        if(sTag in oOrdered) {
            return oOrdered[sTag];
        } else {
            return 999999999;    
        }
    }

    return Module;
}
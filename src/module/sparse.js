var Sparse = function() {
    var data = {},
    counter = -1,
    Module = {};

    Module.push = function(value) {
        counter++;
        if(!isNaN(value) && value !== 0) {
            data[counter] = value;
        }
    };

    Module.get = function(index) {
        if(index in data && data[index] !== 0) {
            return data[index];
        } else {
            return 0;
        }
    };

    Module.getLength = function() {
        return counter+1;   
    };

    Module.toArray = function() {
        var array = [];

        for (var i = 0; i <= counter; i++) {
            array.push(Module.get(i));
        };
        return array;
    };

    Module.toSting = function() {
        return data;
    }

    return Module;    
};

module.exports = Sparse;
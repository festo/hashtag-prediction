// Modules
var argv =  require('optimist')
            .usage('Usage: $0 --in [file] --out [file] --hun')
            .demand(['in', 'out'])
            .boolean('hun')
            .argv;

var _       = require('underscore');
var fs      = require('fs');
var JSONStream = require('JSONStream');
var jf      = require('jsonfile');
var es          = require('event-stream');

// Global variables
var oData = [],
    nCounter = 0;

var getStream = function () {
    var stream = fs.createReadStream(argv.in, {encoding: 'utf8'}),
        parser = JSONStream.parse('*');
    return stream.pipe(parser);
}

// start parse
getStream().pipe(
    es.mapSync(function (data) {
        process.stdout.clearLine();  // clear current text
        process.stdout.cursorTo(0);
        process.stdout.write("Parsed object: " + (++nCounter));
        if(data.tags.length !== 0) {
                if(data.hun) {
                    data.text = data.text.split("\n").join(" ");

                    // filter text
                    var aTokens = _.filter(data.text.split(' '), function(word){
                        // remove buzz words
                        if(word.length < 3) {
                            return false; 
                        }

                        if(word.substr(0,1) === "#") {
                            return false;
                        }

                        if(word.substr(0,4) === "http") {
                            return false;
                        }

                        return true;
                    });

                    if(aTokens.length === 0) {
                        return;
                    }

                    data.text = aTokens.join(' ');

                    // filter tags
                    aTokens = _.filter(data.tags, function(word){
                        // remove buzz words
                        if(word.length < 3) {
                            return false; 
                        }

                        return true;
                    });
                    data.tags = aTokens;

                    if(data.tags.length === 0 || data.text.length === 0) {
                        return;
                    }

                    // remove urls
                    // data.text = data.text.replace(/^(\[url=)?(https?:\/\/)?(www\.|\S+?\.)(\S+?\.)?\S+$\s*/mg, '');

                    oData.push({
                        "user": data.user.id,
                        "text": data.text,
                        "tags": data.tags,
                        "date": data.created_at["$date"]
                    });
                }
        }    
    })

).on('error', function (err){
    console.log("Error!");
    console.error(err);

}).on('end', function() {
    console.log("\nWrite file...")

    jf.writeFile(argv.out, oData);
    console.log("Done!");
    console.log("Tweet count: " + oData.length);
});
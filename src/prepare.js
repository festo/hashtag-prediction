// Modules
var argv =  require('optimist')
            .usage('Usage: $0 -in [file] -out [file]')
            .demand(['in', 'out'])
            .argv;

var fs =    require('fs');
var JSONStream = require('JSONStream');
var jf =    require('jsonfile');
var es = require('event-stream');

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
        if(data.hun) {
            oData.push({
                "user": data.user.id,
                "text": data.text,
                "tags": data.tags,
                "date": data.created_at["$date"]
            });
        }
    });

).on('error', function (err){
    console.log("Error!");
    console.error(err);

}).on('end', function() {
    console.log("\nWrite file...")

    jf.writeFile(argv.out, oData);
    console.log("Done!");
    console.log("HUngarian tweet count: " + oData.length);
});
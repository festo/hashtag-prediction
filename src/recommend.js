var argv =  require('optimist')
            .usage('Usage: $0 --in [file]')
            .demand(['in'])
            .argv;

var similarUsers = require('./similarUsers.js');
var jf =    require('jsonfile');
var oData,
    simU;

//read file
oData = jf.readFileSync(argv.in); 

console.log("Create user model");
simU = similarUsers(oData);

console.log(simU.getTopNUser('23603219', 5));

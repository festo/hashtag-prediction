var argv =  require('optimist')
            .usage('Usage: $0 --in [file] -s [split percentage] -dir')
            .demand(['in', 's', 'dir'])
            .argv;

var _ =     require('underscore');
var jf =    require('jsonfile');

var oData = jf.readFileSync(argv.in); 
var oTrainData = [];
var oTestData = [];

var nTestDataCount = Math.floor(oData.length * ((100 - argv.s) / 100));

console.log('All data: ' + oData.length);


// http://stackoverflow.com/a/2380113/673665
var arr = []
while(arr.length < nTestDataCount){
  var randomnumber=Math.ceil(Math.random()*oData.length)
  var found=false;
  for(var i=0;i<arr.length;i++){
    if(arr[i]==randomnumber){found=true;break}
  }
  if(!found)arr[arr.length]=randomnumber;
}

// copy
for (var i = 0; i < arr.length; i++) {
    oTestData.push(oData[arr[i]]);
};

console.log('Test data: ' + oTestData.length);

// rebuild
for (var i = 0; i < oData.length; i++) {
    if(arr.indexOf(i) === -1) {
        oTrainData.push(oData[i]);
    }
};

console.log('Train data: ' + oTrainData.length);


jf.writeFile(argv.dir + '/train.json' , oTrainData);
jf.writeFile(argv.dir + '/test.json' , oTestData);
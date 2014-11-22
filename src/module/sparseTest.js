var Sparse      = require('./sparse.js');

var data = new Sparse();

console.log(data.get(0));
console.log(data.push(1));
console.log(data.push(2));
console.log(data.get(0));
console.log(data.getLength());
console.log(data.toArray());


var Home = require('../utils/user/home');


var home = new Home();
var map = new Map();

map.set("kaola",home);
map.set(home,"kaola");
console.log(map);
console.log(map['kaola']);
console.log(map.get('kaola') == map['kaola']);















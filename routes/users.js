var express = require('express');
var User = require('../controller/user');
var router = express.Router();


var user = new User();

/* GET users listing. */
router.get('/login',user.index);
router.post('/login',user.login);



module.exports = router;

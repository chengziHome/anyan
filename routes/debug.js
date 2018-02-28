var express = require('express');
var Debug = require('../controller/debug');
var router = express.Router();


var debug = new Debug();

router.get('/img',debug.img);
router.post('/img',debug.img);
router.get('/ws',debug.ws);
router.get('/printHome',debug.printHome);
router.get('/printTcpHome',debug.printTcpHome);
router.get('/printSocketList',debug.printSocketSize);
router.get('/printSliceLength',debug.printSliceLength);


module.exports = router;









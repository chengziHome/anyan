var express = require('express');
var Video = require('../controller/video');
var router = express.Router();

var video = new Video();

router.get('/initServer',video.initWS);
router.post('/play',video.play);

module.exports = router;















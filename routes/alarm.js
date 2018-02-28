var express = require('express');
var Alarm = require('../controller/alarm');
var HomeAlarm = require('../home/home-alarm');
var HomeUser = require('../home/home-user');
var router = express.Router();

var alarm = new Alarm();
var homeAlarm = new HomeAlarm();
var homeUser = new HomeUser()

router.get('/initServer',alarm.init);
router.get('/initClient',homeAlarm.init);
router.get('/homeAlarm',homeAlarm.alarm);

module.exports = router;















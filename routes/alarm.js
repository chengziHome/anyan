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
router.get('/homeLogin',homeAlarm.login);
router.get('/homeAlarm',homeAlarm.alarm);
router.get('/homeUserLogin',homeUser.login);

module.exports = router;















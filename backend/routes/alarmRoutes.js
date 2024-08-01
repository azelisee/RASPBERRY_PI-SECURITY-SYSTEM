const express = require('express');
const router = express.Router();
const alarmController = require('../controllers/alarmController');

router.post('/arm', alarmController.armSystem);
router.post('/disarm', alarmController.disarmSystem);
router.post('/alarm', alarmController.handleAlarm);
router.get('/status', alarmController.getStatus);
router.post('/reset', alarmController.handleAlarm);

module.exports = router;

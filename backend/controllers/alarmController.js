const Zone = require('../models/zone');
const SystemStatus = require('../models/system');
const axios = require('axios');

const initializeSystemStatus = async () => {
  const systemStatus = await SystemStatus.findOne({});
  if (!systemStatus) {
    await SystemStatus.create({ status: 'disarmed' });
  }
};
initializeSystemStatus();

exports.getStatus = async (req, res) => {
  try {
    const zones = await Zone.find({});
    const systemStatus = await SystemStatus.findOne({});
    res.json({ status: systemStatus ? systemStatus.status : 'disarmed', zones });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch status' });
  }
};

exports.armSystem = async (req, res) => {
  try {
    const systemStatus = await SystemStatus.findOne({});
    if (systemStatus && systemStatus.status === 'armed') {
      res.json({ status: 'already armed' });

    } else {
      console.log('Arming the system...');
      await axios.post('http://10.1.2.125:5000/arm');
      await SystemStatus.findOneAndUpdate({}, { status: 'armed' }, { upsert: true });
      res.json({ status: 'armed' });
      console.log('System armed');
    }

  } catch (error) {
    res.status(500).json({ error: 'Failed to arm the system' });
  }
};

exports.disarmSystem = async (req, res) => {
  try {
    const systemStatus = await SystemStatus.findOne({});
    if (systemStatus && systemStatus.status === 'disarmed') {
      res.json({ status: 'already disarmed' });

    } else {
      console.log('Disarming the system...');
      await axios.post('http://10.1.2.125:5000/disarm');
      await SystemStatus.findOneAndUpdate({}, { status: 'disarmed' }, { upsert: true });
      res.json({ status: 'disarmed' });
      console.log('System disarmed');
    }

  } catch (error) {
    res.status(500).json({ error: 'Failed to disarm the system' });
  }
};

exports.handleAlarm = async (req, res) => {
  const { zone } = req.body;
  try {
    const systemStatus = await SystemStatus.findOne({});

    if (systemStatus && systemStatus.status === 'armed') {

      if (typeof zone === 'number' && zone >= 1 && zone <= 4) {
        console.log(`Received alarm request for zone: ${zone}`);
        await axios.post('http://10.1.2.125:5000/alarm', { zone });
        await Zone.findOneAndUpdate({ zone }, { status: 'alarm' }, { upsert: true });
        res.json({ status: `Alarm handled for zone ${zone}` });
        console.log(`Alarm handled for zone ${zone}`);

      } else if (zone === 'reset') {
        console.log('Resetting the system...');
        await axios.post('http://10.1.2.125:5000/reset');
        await Zone.updateMany({}, { status: 'disarmed' });
        res.json({ status: 'reset' });
        console.log('System reset');

      } else {
        console.error(`Invalid zone: ${zone}`);
        res.status(400).json({ error: `Invalid zone: ${zone}` });
      }

    } else {
      res.json({ status: 'System is not armed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to handle alarm' });
  }
};

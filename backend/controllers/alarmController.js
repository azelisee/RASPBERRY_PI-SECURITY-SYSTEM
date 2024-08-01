const Zone = require('../models/zone');
const axios = require('axios');


exports.getStatus = async (req, res) => {
  try {
    const zones = await Zone.find({});
    const systemStatus = systemStatus ? 'armed' : 'disarmed';
    await axios.get('http://10.1.2.125:5000/status');
    res.json({ status: systemStatus, zones });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch status' });
  }
};

exports.armSystem = async (req, res) => {
  console.log('Arming the system...');
  await axios.post('http://10.1.2.125:5000/arm');
  res.json({ status: 'armed' });
  console.log('System armed');
};

exports.disarmSystem = async (req, res) => {
  console.log('Disarming the system...');
  await axios.post('http://10.1.2.125:5000/disarm');
  res.json({ status: 'disarmed' });
  console.log('System disarmed');
};

exports.handleAlarm = async (req, res) => {
  const { zone } = req.body;
  console.log(`Received alarm request for zone: ${zone}`);
  if (typeof zone === 'number' && zone >= 1 && zone <= 4) {
    await axios.post('http://10.1.2.125:5000/alarm', { zone });
    await Zone.findOneAndUpdate({ zone }, { status: 'alarm' }, { upsert: true });
    res.json({ status: `Alarm handled for zone ${zone}` });
    console.log(`Alarm handled for zone ${zone}`);

  } else if (zone === 'reset') {
    await axios.post('http://10.1.2.125:5000/reset');
    res.json({ status: 'reset' });
    console.log('System reset');

  } else {
    console.error(`Invalid zone: ${zone}`);
    res.status(400).json({ error: `Invalid zone: ${zone}` });
  }
};

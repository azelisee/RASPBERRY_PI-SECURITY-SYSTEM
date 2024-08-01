const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
  zone: Number,
  status: String
});

const Zone = mongoose.model('Zone', zoneSchema);

module.exports = Zone;

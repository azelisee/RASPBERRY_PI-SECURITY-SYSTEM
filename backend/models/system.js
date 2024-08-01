const mongoose = require('mongoose');

const systemStatusSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['armed', 'disarmed'],
    required: true,
    default: 'disarmed'
  }
});

const SystemStatus = mongoose.model('SystemStatus', systemStatusSchema);

module.exports = SystemStatus;

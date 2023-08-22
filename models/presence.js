const mongoose = require('mongoose');

const presenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  }
});

exports.Presence = mongoose.model('Presence', presenceSchema);
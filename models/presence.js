const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

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

presenceSchema.plugin(mongoosePaginate);
exports.Presence = mongoose.model('Presence', presenceSchema);
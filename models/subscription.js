const mongoose = require('mongoose');

const subscriptionSchema  = new mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  price:{
    type: Number,
    required: true
  },
  duration:{
    type: Number,
    required: true
  },
});

exports.Subscription = mongoose.model('Subscription', subscriptionSchema);
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:{ 
    type: String,
    required: true,
    unique: true
},
  passwordHash:{ 
    type: String,
    required: true
},
  subscriptionStatus:{ 
    type: Boolean,
    default: false
},
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
},
  subscriptionExpiration:{
    type: Date
},
});

exports.User = mongoose.model('User', userSchema);
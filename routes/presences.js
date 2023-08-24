const express = require("express");
const router = express.Router();
const { Presence } = require("../models/presence");
const adminJwt = require("../middlewares/adminJwt");


router.get('/',adminJwt, async (req, res) => {
  try {
    const Presences = await Presence.find().populate({
        path:'user',
        select:'-passwordHash -isAdmin -subscriptionExpiration'
    });
    res.json(Presences);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;

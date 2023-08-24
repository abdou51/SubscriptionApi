const express = require("express");
const router = express.Router();
const { Presence } = require("../models/presence");
const adminJwt = require("../middlewares/adminJwt");
const dateQueryBuilder = require('../filterPaginationQueries/dateQueryBuilder');
const mongoose = require('mongoose');


router.get('/', adminJwt, async (req, res) => {
  try {
    const { year, month, day, page, limit } = req.query;
    const query = dateQueryBuilder.buildQuery(year, month, day);

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10
    };

    const Presences = await Presence.paginate(query, options, {
      populate: {
        path: 'user',
        select: '-passwordHash -isAdmin -subscriptionExpiration'
      }
    });

    if (Presences.docs.length === 0) {
      return res.status(404).json({ error: 'No data found.' });
    }

    res.json(Presences);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




module.exports = router;
const express = require("express");
const router = express.Router();
const schedule = require("node-schedule");
const { User } = require("../models/user");
const { Subscription } = require("../models/subscription");
const adminJwt = require("../middlewares/adminJwt");

schedule.scheduleJob("*/30 * * * * *", async () => {
  try {
    const users = await User.find({ subscriptionStatus: true });

    for (const user of users) {
      if (user.subscriptionExpiration <= new Date()) {
        user.subscriptionStatus = false;
        user.subscriptionExpiration = undefined;
        await user.save();
        console.log("User subscription status updated:", user._id);
      }
    }
  } catch (error) {
    console.error("Error updating subscription status:", error);
  }
});

router.post("/",adminJwt, async (req, res) => {
  try {
    const newSubscriptionPlan = new Subscription({
      name: req.body.name,
      price: req.body.price,
      duration: req.body.duration,
    });
    await newSubscriptionPlan.save();
    res.status(201).json(newSubscriptionPlan);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id",adminJwt, async (req, res) => {
  try {
    const subscriptionId = req.params.id;
    const updatedSubscription = {
      name: req.body.name,
      price: req.body.price,
      duration: req.body.duration,
    };

    const result = await Subscription.findByIdAndUpdate(
      subscriptionId,
      updatedSubscription,
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.delete("/:id",adminJwt, async (req, res) => {
  try {
    const subscriptionId = req.params.id;

    const result = await Subscription.findByIdAndDelete(subscriptionId);

    if (!result) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.status(204).json({ message: "Subscription Deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.post("/purchaseSubscription/", adminJwt, async (req, res) => {
  try {
    const userId = req.body.userId;
    const selectedPlanId = req.body.planId;

    const selectedPlan = await Subscription.findById(selectedPlanId);
    if (!selectedPlan) {
      return res.status(404).json({ message: "Subscription plan not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.subscriptionStatus = true;
    user.subscriptionExpiration = new Date(
      Date.now() + selectedPlan.duration * 24 * 60 * 60 * 1000,
    );
    await user.save();

    res.json({ message: "Subscription purchased successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
});

module.exports = router;

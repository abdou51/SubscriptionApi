const { User } = require("../models/user");
const express = require("express");
const generateToken = require("../middlewares/jwtMiddleware");
const router = express.Router();
const bcrypt = require("bcrypt");
const { Presence } = require("../models/presence");
const { DateTime } = require('luxon');
const algeriaTime = DateTime.now().setZone('Africa/Algiers');
const userJwt = require("../middlewares/userJwt");
const adminJwt = require("../middlewares/adminJwt");


router.get("/:id",adminJwt, async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("-passwordHash -isAdmin");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/profile",userJwt, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select("-passwordHash -isAdmin");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id",userJwt, async (req, res) => {
  try {
    const userId = req.user.userId;

    const userExist = await User.findById(userId);
    let newPassword;

    if (req.body.password) {
      newPassword = bcrypt.hashSync(req.body.password, 10);
    } else {
      newPassword = userExist.passwordHash;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        username: req.body.username,
        passwordHash: newPassword,
        isAdmin: false
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(400).send("The user cannot be found!");
    }

    res.send(updatedUser);
  } catch (error) {
    res.status(500).send("An error occurred while updating the user.");
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      return res.status(400).send("The user not found");
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
      try {
        if (!user.isAdmin && !user.subscriptionStatus) {
          return res.status(400).send("User subscription is not active.");
        }
        let token;
        
        if (user.isAdmin) {
          token = generateToken(user.id, user.isAdmin);
        } else {
          const startOfDay = algeriaTime.startOf("day");
          const endOfDay = algeriaTime.endOf("day");
          const existingPresence = await Presence.findOne({
            user: user._id,
            date: {
              $gte: startOfDay.toJSDate(),
              $lt: endOfDay.toJSDate(),
            },
          });

          if (!existingPresence) {
            const newPresence = new Presence({
              user: user._id,
              date: algeriaTime.toJSDate(),
            });

            await newPresence.save();
          } else {
            return res
              .status(400)
              .send("User already marked presence for the day.");
          }
          
          token = generateToken(user.id, user.isAdmin);
        }

        res.setHeader("Authorization", `Bearer ${token}`);
        res.status(200).send("Login successful");
      } catch (presenceError) {
        res.status(500).send("An error occurred while checking user presence.");
      }
    } else {
      res.status(400).send("Password is wrong!");
    }
  } catch (error) {
    res.status(500).send("An error occurred while finding the user.");
  }
});




router.post("/register", async (req, res) => {
  try {
    let user = await User.findOne({ username: req.body.username });

    if (user) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User with given username already exists",
        });
    }

    if (req.body.username === req.body.password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Your username cannot be your password",
        });
    }

    user = new User({
      username: req.body.username,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      isAdmin: false,
    });

    user = await user.save();

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "The user cannot be created" });
    }

    const token = generateToken(user.id,user.isAdmin);

    res.setHeader("Authorization", `Bearer ${token}`);
    res
      .status(200)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error });
  }
});

router.delete("/:id",userJwt, async (req, res) => {
  try {
    const userId = req.user.userId;
    const deletedUser = await User.findByIdAndRemove(userId);

    if (deletedUser) {
      return res
        .status(200)
        .json({ success: true, message: "The user Is deleted!" });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error });
  }
});

module.exports = router;

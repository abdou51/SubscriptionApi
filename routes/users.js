const {User} = require('../models/user');
const express = require('express');
const generateToken = require('../middlewares/jwtMiddleware');
const router = express.Router();
const bcrypt = require('bcrypt');



router.get('/profile', async (req, res) => {
  try {
      const userId = req.user.userId;

      const user = await User.findById(userId).select('-passwordHash');

      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json(user);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});
  

router.put('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
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
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(400).send('The user cannot be found!');
    }

    res.send(updatedUser);
  } catch (error) {
    res.status(500).send('An error occurred while updating the user.');
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      return res.status(400).send('The user not found');
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
      try {
        const token = generateToken(user.id);

        res.setHeader('Authorization', `Bearer ${token}`);
        res.status(200).send('Login successful');
      } catch (tokenError) {
        res.status(500).send('An error occurred while generating token.');
      }
    } else {
      res.status(400).send('Password is wrong!');
    }
  } catch (error) {
    res.status(500).send('An error occurred while finding the user.');
  }
});
  

router.post('/register', async (req, res) => {
  try {
    
    let user = await User.findOne({ username: req.body.username });

    if (user) {
      return res.status(400).json({ success: false, message: 'User with given username already exists' });
    }

    if (req.body.username === req.body.password) {
      return res.status(400).json({ success: false, message: 'Your username cannot be your password' });
    }

    user = new User({
      username: req.body.username,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
    });

    user = await user.save();

    if (!user) {
      return res.status(400).json({ success: false, message: 'The user cannot be created' });
    }

    const token = generateToken(user.id);

    res.setHeader('Authorization', `Bearer ${token}`);
    res.status(200).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error });
  }
});
  

router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndRemove(userId);

    if (deletedUser) {
      return res.status(200).json({ success: true, message: 'The user Is deleted!' });
    } else {
      return res.status(404).json({ success: false, message: 'User not found!' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error });
  }
});

module.exports =router;
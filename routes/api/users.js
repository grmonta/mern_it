const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

// @route   POST api/users
// @desc    Register User
// @access  Public
router.post(
  '/',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    //if errors send this
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //see if user exist send error if does

    //get user data from req.body so destructur it to make easier
    // destruct name email and pw

    const { name, email, password } = req.body;

    try {
      //if does not exist
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      //GEt user gravatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });

      //create a new user (this doesn't save it, will have to call save, but first encrypt pw)
      user = new User({
        name,
        email,
        avatar,
        password
      });

      //encrypt password using bcrypt
      //variable to do the hashing
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      //now save user to database, which returns a promise so use async

      await user.save();

      //return the jsonwebtoken so user get logins on front end right away

      res.send('User Registered');
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;

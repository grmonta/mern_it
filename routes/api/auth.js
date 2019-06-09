const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');
const User = require('../../models/User');

// @route   GET api/auth
// @desc    Test route
// @access  Public

//add auth middle wear to request to protect it
router.get('/', auth, async (req, res) => {
  try {
    //can access user from middleware in a proteced route
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/auth
// @desc    Authenticate user and get token
// @access  Public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    //if errors send this
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //see if user exist send error if does

    //get user data from req.body so destructur it to make easier
    // destruct  email and pw

    const { email, password } = req.body;

    try {
      //if not a user, send back error

      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      //need to make sure password is correct with bcrypt
      //functions compare takes encrypted pw and user pw and tells if same or not
      //it returns a promise

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      //return the jsonwebtoken so user get logins on front end right away definte user payload
      //you can now access the user data, like id

      const payload = {
        user: {
          id: user.id
        }
      };

      //  jwt.sign takes a payload and a secret, saved in config and after token can put an option
      //set of options, exprires in 3600 in production
      // but for testing put it in 360000, then it takes
      // a callback function which takes err, token as an argument
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );

      // res.send('User Registered');
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;

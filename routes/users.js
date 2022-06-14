const { clearCache } = require('ejs');
const express = require('express');
const { Passport } = require('passport/lib');
const { register } = require('../models/user');
const router = express.Router({ mergeParams: true });
const User = require('../models/user');
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const { isLoogedIn } = require('../middlware');
const users = require('../controllers/users')

router.route('/register')
  .get(users.renderRegister)
  .post(catchAsync(users.registerNewUser));

router.route('/login')
  .get(users.renderLogin)
  .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', failureMessage: true, keepSessionInfo: true }), users.loginUser);


router.get('/logout', users.logoutUser);

module.exports = router;
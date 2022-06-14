const User = require('../models/user');
const passport = require('passport');
const { Passport } = require('passport/lib');
const { register } = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

module.exports.registerNewUser = async (req, res,next) => {
    try{
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registerdUser = await User.register(user, password);
    
    req.login(registerdUser, err=>{
        if(err) {
          return next(err);
        } 
      req.flash('success', "welcome");
      res.redirect('/campgrounds');
    })
    
    } catch (e){
        
        req.flash('error', e.message);
        res.redirect('register');
    }
    
}

module.exports.renderLogin = (req, res) => {
    
    res.render('users/login')
}

module.exports.loginUser = (req, res) => {
    req.flash('success','Welcome back');
    console.log(req.session.returnTo)
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
    
}

module.exports.logoutUser = function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash('success','Goodbye');
      res.redirect('/campgrounds');
    });
  }
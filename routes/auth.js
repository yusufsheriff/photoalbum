var express = require('express');
var router = express.Router();
var passport = require('passport');
const async= require('async');


// Perform the login, after login Auth0 will redirect to callback
router.get('/login', passport.authenticate('auth0', {
  scope: 'openid email profile'
}), function (req, res) {
  res.redirect('/');
});

// Perform the final stage of authentication and redirect to previously requested URL or '/user'
router.get('/callback', function (req, res, next) {
  passport.authenticate('auth0', function (err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.logIn(user, function (err) {
      if (err) { return next(err); }
      const returnTo = req.session.returnTo;
      delete req.session.returnTo;




  //   console.log(user.nickname);




      // admin.auth.createCustomToken()
      //   .then(function(customToken){
      //
      //   })
      //   .catch(function(error){
      //
      //   })
      //

      res.redirect('/dashboard');
    });
  })(req, res, next);
});

// Perform session logout and redirect to homepage
router.get('/logout', (req, res) => {
  // req.logout();
  // res.redirect('https://photoalbum.auth0.com/v2/logout');

  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }

  //res.redirect("/");
});

module.exports = router;
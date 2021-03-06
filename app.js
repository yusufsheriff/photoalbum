var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser=require("body-parser");
var dotenv = require('dotenv');
var passport = require('passport');
var Auth0Strategy = require('passport-auth0');
var flash = require('connect-flash');
var userInViews = require('./lib/middleware/userInViews');
var authRouter = require('./routes/auth');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dashboardRouter= require("./routes/dashboard");
// default parser without destructuring
const fileParser = require('express-multipart-file-parser');




dotenv.load();

// Configure Passport to use Auth0
var strategy = new Auth0Strategy(
  {
    domain: "photoalbum.auth0.com",
    clientID:"-Nu7paWTNLNxPwn-kjP2jC9aX-PlUK37",
    clientSecret:"bk9w6iQ48x6SSSSZG40Q6seqHOuWhvWjxZCwDG9j7_Tvc-wHCG28CneuYSNoQFWj",
    callbackURL:
      process.env.AUTH0_CALLBACK_URL||"http://localhost:5000/callback"
  },
  function (accessToken, refreshToken, extraParams, profile, done) {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
//    console.log(extraParams.id_token);
    // profile has all the information from the user
    return done(null, profile);
  }
);

passport.use(strategy);

// You can use this section to keep a smaller payload
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
//app.use(fileParser);
//app.use(express.bodyParser());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// config express-session
var sess = {
  secret: 'CHANGE THIS SECRET',
  cookie: {},
  resave: false,
  saveUninitialized: true
};


app.enable('trust proxy');
if (app.get('env') === 'production') {
  sess.cookie.secure = true; // serve secure cookies, requires https
// in production on Heroku - re-route everything to https
//  app.use((req, res, next) => {
 //  req.header('x-forwarded-proto');
  //});
  app.use(function(req, res, next){
  	if(req.header('x-forwarded-proto') !== 'https'){
  		res.redirect('https://' + req.header('host') + req.url);
  	}else{
  		next();
  	}
  });

}

app.use(session(sess));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());

// Handle auth failure error messages
app.use(function (req, res, next) {
  if (req && req.query && req.query.error) {
    req.flash('error', req.query.error);
  }
  if (req && req.query && req.query.error_description) {
    req.flash('error_description', req.query.error_description);
  }
  next();
});

app.use(userInViews());
app.use('/', authRouter);
app.use('/', indexRouter);
app.use('/', usersRouter);
app.use("/",dashboardRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handlers

// Development error handler
// Will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// Production error handler
// No stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;

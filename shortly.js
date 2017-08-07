var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
// Require bcrypt
var bcrypt = require('bcrypt-nodejs');

// Require session module
var session = require('express-session');

// Require the salt for cookie
const config = require('./config.js');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// CREATE A SESSION //////////////////////////////
app.use(session({
  secret: config.secret,
  resave: false,
  saveUninitalized: true
}));

// GET //////////////////////////////////////////
app.get('/', util.checkUser, function(req, res) {
  res.render('index');
});

app.get('/create', util.checkUser, function(req, res) {
  res.render('index');
});

/////////////////////////////////////////////////

app.get('/login', function(req, res) {
  console.log('you are in LOG IN');
  res.render('login');
});

app.get('/signup', function(req, res) {
  console.log('you are in SIGN UP');
  res.render('signup');
});

app.get('/links', util.checkUser, function(req, res) {
  console.log('you are looking at LINKS')
  Links.reset().fetch().then(function(links) {
    res.status(200).send(links.models);
  });
});

app.get('/logout', function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
});
// POST /////////////////////////////////////////
app.post('/links', util.checkUser, function(req, res) {
  var uri = req.body.url;
  console.log('i am app.post to LINKS');
  console.log(uri);
  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.status(200).send(found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }
        // var user = User({id: }).fetch();
        Links.create({
          // userId: ,
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        })
        .then(function(newLink) {
          res.status(200).send(newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/
app.post('/signup', function(req, res) {
  // User.prototype.storeUser(req.body.username, req.body.password);

    var username = req.body.username;
    var password = req.body.password;

    new User({ username: username })
      .fetch()
      .then(function(user){
        if(!user){
          bcrypt.hash(password, null, null, function(err, hash){
            Users.create({
              username: username,
              password: hash
            }).then(function(user){
                util.createSession(req, res, user);
            });
         });
        }
     });
});

app.post('/login', function(req, res) {
  console.log('Input at login: ', req.body);
  // User.prototype.checkUser(req.body.username, req.body.password)

  var username = req.body.username;
  var password = req.body.password;

  new User({ username: username })
    .fetch()
    .then(function(user) {
      if (!user) {
        res.redirect('/login');
      } else {
        bcrypt.compare(password, user.get('password'), function(err, match) {
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        });
      }
    });
});



/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  console.log('i am app.get on line 91')
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        linkId: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

module.exports = app;

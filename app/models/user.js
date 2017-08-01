var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var username;
var password;
var hashedPass;

var User = db.Model.extend({
  tableName: 'users',

  // initialize: function(){
  //   this.on('creating', function(model, attrs, options) {

  //     model.set('username', username);
  //     model.set('password', hashedPass);
  //   });
  // },

  storeUser: function(name, pass){
    username = name;
    password = pass;

    console.log('Did it work? User + Pass: ', username, password);

    this.hashPassword(password);
    console.log('Did it hash? ', hashedPass);

    // Store username and password to database
    this.storeInfo(username, hashedPass);
  },


  checkUser: function(name, pass){
    username = name;
    password = pass;

    this.hashPassword(password);
    console.log('Did it hash? ', hashedPass);
    // Compare hashedPass to what's in the database

  },

  hashPassword: function(password) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    hashedPass = hash;
    // hashing function
  },

  storeInfo: function(un, pw) {
    model.set('username', un);
    model.set('password', pw);
  }


});

module.exports = User;
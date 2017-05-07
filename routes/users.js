var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Users = require('../models/Users.js');
var Posts = require('../models/Posts');

/* GET /users/id */
router.get('/:username', function(req, res, next) {
  Users.findOne({username: new RegExp("^" + req.params.username + "$", "i") }, function (err, user) {
    if (err) return next(err);
    if (user) { res.send("This is " + user.username + "'s profile. <br> They have " + user.balance + " marks.") }
    else { res.send("That user does not exist.") }
  });
});

/* POST /users/login */
router.post('/login', function(req, res, next) {
  var randomstring = require("randomstring");  
  var login_cookie = randomstring.generate();
  console.log(req.body.username);
  Users.findOneAndUpdate({'username': new RegExp("^" + req.body.username + "$", "i"), 'password': req.body.password },  {"login-cookie": login_cookie },  function (err, post) {
    if (err) return next(err);
    if (post) { res.cookie("login-cookie", login_cookie).render('bitmark', { title: "Bitmark" }) }
    else { res.send("ERROR") }
  });
});

/* POST /users */
router.post('/createAccount', function(req, res, next) {
  var exec = require('child_process').exec;
  var fs = require('fs');
  var path = require('path');

  exec('bitmarkd getnewaddress', function(error, stdout) {
    req.body.wallet = stdout.trim();
    req.body.balance = 10;
    req.body.reputation = 0;
    Users.create(req.body, function (err, post) {
      fs.createReadStream(path.join(__dirname, '../public/images/default-user-image.png')).pipe(fs.createWriteStream(path.join(__dirname, '../uploads/' + req.body.username)));
      if (err) return next(err);
      res.json(post);
    });
  });

});

/* GET /users listing. */
//router.get('/', function(req, res, next) {
//  Users.find(function (err, users) {
//    if (err) return next(err);
//    res.json(users);
//  });
//});

/* PUT /users/:id */
//router.put('/:id', function(req, res, next) {
//  Users.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
//    if (err) return next(err);
//    res.json(post);
//  });
//});

/* DELETE /users/:id */
//router.delete('/:id', function(req, res, next) {
//  Users.findByIdAndRemove(req.params.id, req.body, function (err, post) {
//    if (err) return next(err);
//    res.json(post);
//  });
//});

module.exports = router;

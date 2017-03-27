var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Users = require('../models/Users.js');
var Posts = require('../models/Posts');

/* GET /users listing. */
router.get('/', function(req, res, next) {
  Users.find(function (err, users) {
    if (err) return next(err);
    res.json(users);
  });
});

/* GET /users/id */
router.get('/:id', function(req, res, next) {
  Users.findOne({username: req.params.id}, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* POST /users/login */
router.post('/login', function(req, res, next) {
  var randomstring = require("randomstring");  
  var login_cookie = randomstring.generate();
  Users.findOneAndUpdate(req.body, {"login-cookie": login_cookie },  function (err, post) {
    if (err) return next(err);
    if(post){
      console.log(post);
      res.cookie("login-cookie", login_cookie)
      .render('bitmark', { title: "Bitmark" });//("Logged in as " + req.body.username)} else { res.send("Error logging in")     
    } else { 
      res.send("ERROR"); }
  });
});

/* POST /users */
router.post('/', function(req, res, next) {
  var exec = require('child_process').exec;
  var cmd = 'bitmarkd getnewaddress';
  var fs = require('fs');
  var path = require('path');

  exec(cmd, function(error, stdout, stderr) {
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

/* PUT /users/:id */
router.put('/:id', function(req, res, next) {
  Users.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* DELETE /users/:id */
router.delete('/:id', function(req, res, next) {
  Users.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

module.exports = router;

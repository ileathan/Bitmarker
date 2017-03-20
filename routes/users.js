var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Users = require('../models/Users.js');

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
  Users.create(req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* PUT /todos/:id */
router.put('/:id', function(req, res, next) {
  Users.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* DELETE /todos/:id */
router.delete('/:id', function(req, res, next) {
  Users.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

module.exports = router;

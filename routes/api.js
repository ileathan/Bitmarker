var express = require('express');
var router = express.Router();
var Users = require('../models/Users.js');
var Posts = require('../models/Posts.js');

router.get('/posts', function(req, res, next) {
  Posts.find(function (err, posts) {
    if (err) return next(err);
    res.json(posts);
  });
});

router.get('/replies', function(req, res, next) {
  Posts.find({ "replyto": { $exists: true } }, function (err, replies) { res.json(replies) })
});

router.get('/markings', function(req, res, next) {
  Posts.find({ "ismarking": { $exists: true } }, function (err, markings) { res.json(markings) })
});


router.get('/markings/:username', function(req, res, next) {
  Post.find({ "ismarking": req.params.username }, function (err, markings) { res.json(markings) })
});

router.get('/info', function(req, res, next) {
  Users.findOne({"login-cookie": req.cookies["login-cookie"]}, function (err, user) {
    user.password = ""; user['login-cookie'] = "";// Don't return the sensitive information via ajax response
    res.json(user)
  })
});

router.post('/mark', function(req, res, next) {
  Posts.findOne({"_id": req.body._id}, function (err, marked_post) {
    Users.findOne({"login-cookie": req.headers.cookie.split("login-cookie=")[1].split(';')[0] }, function (err, marking_user) {
      if (!marking_user) return; // NOT LOGGED IN
      if (marking_user.balance < 1) return; // NOT ENOUGH BALANCE
      Users.findByIdAndUpdate(marking_user._id,                    { $inc: { "balance": -1 } }, function () {});
      Users.findOneAndUpdate({ "username": marked_post.username }, { $inc: { "balance":  1 } }, function () {});
      Posts.findOneAndUpdate({ "_id": req.body._id },              { $inc: { "marks"  :  1 } }, function () {});
      Posts.create({"replyto": marked_post._id, "username": marking_user.username, "ismarking": marked_post.username, "message": req.body.marking_msg, "marks": 0 },
        function (err, marking) { res.json(marking) }
      )
    })
  })
});

router.post('/create', function(req, res, next) {
  Users.findOne({"login-cookie": req.headers.cookie.split("login-cookie=")[1].split(';')[0] }, function (err, creating_user) {
    if (!creating_user) return; // NOT LOGGED IN
    req.body.username = creating_user.username;
    req.body.marks = 0;
    Posts.create(req.body, function (err, post) { res.json(post) })
  })
});

module.exports = router;

var express = require('express');
var router = express.Router();
var Replies = require('../models/Replies.js');
var Users = require('../models/Users.js');
var Posts = require('../models/Posts.js');
var multer = require('multer');

/*  GET /api/posts listing. */
router.get('/posts', function(req, res, next) {
  Posts.find(function (err, users) {
    if (err) return next(err);
    res.json(users);
  });
});

router.get('/mark/:id', function(req, res, next) {
  Posts.findOne({"_id": req.params.id}, function (err, marked_post) {
    if (err) return next(err);
    Users.findOne({"login-cookie": req.headers.cookie.split("login-cookie=")[1].split(';')[0] }, function (err, marking_user) {
      if (!marking_user) return; // NOT LOGGED IN
      if (marking_user.balance < 1) return; // NOT ENOUGH BALANCE
      marked_post.marks++; marking_user.balance--;
      Users.findByIdAndUpdate(marking_user._id, {"balance": marking_user.balance}, function (err, updated_markingUser) {
        if (err) return next(err);
        console.log("-1 to " + updated_markingUser.username + ".");
      });
      Users.findOneAndUpdate({ "username": marked_post.username }, { $inc: {"balance": 1} }, function (err, updated_markedUser) {
        if (err) return next(err);
        console.log("+1 to " + updated_markedUser.username + ".");
      });
      Posts.findOneAndUpdate({ "_id": req.params.id }, { $inc: { "marks": 1 } }, function (err, updated_markedPost) {
        console.log("+1 to post " + updated_markedPost._id);
      })
    });
    res.json(marked_post);
  })
});

router.get('/markReply/:id', function(req, res, next) {
  Replies.findOne({"_id": req.params.id}, function (err, marked_post) {
    if (err) return next(err);
    Users.findOne({"login-cookie": req.headers.cookie.split("login-cookie=")[1].split(';')[0] }, function (err, marking_user) {
      if (!marking_user) return; // NOT LOGGED IN
      if (marking_user.balance < 1) return; // NOT ENOUGH BALANCE
      marked_post.marks++; marking_user.balance--;
      Users.findByIdAndUpdate(marking_user._id, {"balance": marking_user.balance}, function (err, updated_markingUser) {
        if (err) return next(err);
        console.log("-1 to " + updated_markingUser.username + ".");
      });
      Users.findOneAndUpdate({ "username": marked_post.username }, { $inc: {"balance": 1} }, function (err, updated_markedUser) {
        if (err) return next(err);
        console.log("+1 to " + updated_markedUser.username + ".");
      });

      Replies.findOneAndUpdate({ "_id": req.params.id }, { $inc: { "marks": 1 } }, function (err, updated_markedPost) {
        console.log("+1 to post " + updated_markedPost._id);
      })
    });
    res.json(marked_post);
  })
});


router.get('/replies', function(req, res, next) {
  Replies.find(function (err, users) {
    if (err) return next(err);
    res.json(users);
  })
});

router.get('/bycookie', function(req, res, next) {
  console.log(req.cookies["login-cookie"]);
  Users.findOne({"login-cookie": req.cookies["login-cookie"]}, function (err, post) {
    if (err) return next(err);
    if (post) {
        res.json(post)
    } else { console.log("WTF ERROR"); }
  })
});

/* POST /users */
router.post('/', function(req, res, next) {
  req.body.marks = 0;
  Posts.create(req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* POST /users */
router.post('/reply', function(req, res, next) {
  Replies.create(req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});


module.exports = router;

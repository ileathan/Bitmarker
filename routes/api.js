var express = require('express');
var router = express.Router();
var Users = require('../models/Users.js');
var Posts = require('../models/Posts.js');

router.get('/posts/:id', function(req, res, next) {
  res.cookie("state", req.params.id, { expires: new Date(Date.now() + 9000000) }).render('bitmark', { title: "Bitmark" });
});

router.get('/reset', function(req, res, next) {
  Posts.deleteMany({},function(){});
  Users.deleteMany({},function(){});
});

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
    if (user) {
      user.password = ""; user['login-cookie'] = ""; // Don't return the sensitive information via ajax response
      res.json(user)
    }
  })
});

router.get('/info/:username', function(req, res, next) {
  Users.findOne({username: new RegExp("^" + req.params.username + "$", "i") }, function (err, user) {
    if (err) return next(err);
    res.json(user);
  })
});

router.post('/mark', function(req, res, next) {
  Posts.findOne({"_id": req.body._id}, function (err, marked_post) {
    Users.findOne({"login-cookie": req.cookies["login-cookie"]}, function (err, marking_user) {
      if (!marking_user) return; // NOT LOGGED IN
      if (marking_user.balance < 1) return; // NOT ENOUGH BALANCE
      createNotification({"_id": marked_post._id, "username": marked_post.username, "message": marked_post.message});
      Users.findByIdAndUpdate(marking_user._id,                    { $inc: { "balance": -1 } }, function () {});
      Users.findOneAndUpdate({ "username": marked_post.username }, { $inc: { "balance":  1 } }, function () {});
      Posts.findOneAndUpdate({ "_id": req.body._id },              { $inc: { "marks"  :  1 } }, function () {});
      Posts.create(
        {"replyto": marked_post._id, "username": marking_user.username, "ismarking": marked_post.username, "message": req.body.marking_msg, "marks": 0 },
        function (err, marking) { res.json(marking) }
      )
    })
  })
});

router.get('/delete_notification/:id', function(req, res, next) {
  Users.findOne({"login-cookie": req.cookies["login-cookie"]}, function (err, user) {
    if (err) return next(err);
    Users.findOneAndUpdate({'username': user.username },
      { $pull: { 'notifications': {'id': req.params.id.toString() } } }, { multi: true }, function(e,user){ res.json(user) })
  })
});

router.post('/create', function(req, res, next) {
  Users.findOne({"login-cookie": req.cookies["login-cookie"]}, function (err, creating_user) {
    if (!creating_user) return; // NOT LOGGED IN
    req.body.marks = 0;
    req.body.username = creating_user.username;
    Posts.create(req.body, function (err, created_post) {
      res.json(created_post);
      console.log(created_post);
      if (req.body.replyto) {
        Posts.findById(req.body.replyto, function (err, post) {
          if (post.username != creating_user.username) { createNotification(post) } // Dont create notification is user is replying to themselves
        })
      }
    })
  })
});

function createNotification(post) {
  var amount = 1; var index = -1; var found;

  Users.findOne({'username': post.username}, function(err, user) {
    user.notifications.forEach(function(n, i){
      if (n.id.toString() == post._id.toString()) { amount = n.amount + 1; found = i }
    });
    if (amount > 1) {
      var obj = {};
      obj["notifications."+found] = { 'id': post._id.toString(), 'message': post.message, 'amount': amount };
      Users.findOneAndUpdate({'username': post.username}, { $set: obj }, function () {});
    } else {
      Users.findOneAndUpdate({'username': post.username},
        { $push: { 'notifications': { 'id': post._id.toString(),  'message': post.message,  'amount': amount } } }, function () {})
    }
  })
}

module.exports = router;

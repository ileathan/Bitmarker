var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
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

router.get('/bycookie', function(req, res, next) {
  console.log(req.cookies["login-cookie"]);
  Users.findOne({"login-cookie": req.cookies["login-cookie"]}, function (err, post) {
    if (err) return next(err);
    if (post) {
        res.json(post)
    } else { console.log("WTF ERROR"); }
  });
});

/* POST /users */
router.post('/', function(req, res, next) {
  Posts.create(req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

//router.post('/uploads', multer({ dest: '../uploads/' }).single(), function(req,res){
//        console.log(req.body); //form fields
//        console.log(req.file); //form files
//        res.status(204).end();
//});


module.exports = router;

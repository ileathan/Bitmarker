var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Users = require('../models/Users.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.cookies["login-cookie"]){
    Users.findOne({"login-cookie": req.cookies["login-cookie"]}, function (err, post) {
      if (err) return next(err);
      if (post) {
        res.render('bitmark', { title: "Bitmark" })
      } else { res.render('index', { title: "Bitmark" }) }
    });
  } else { res.render('index', {title: "Bitmark" }) }
});

module.exports = router;

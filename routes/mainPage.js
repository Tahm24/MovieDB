//Router module
const express = require("express");
const router = express.Router();

//Bcrypt modules
const bcrypt = require("bcrypt");
const saltrounds = 10;

//Validator
const { check, validationResult } = require('express-validator');

//Handle session redirect
const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect('../users/login')
    } else { 
        next();
    } 
}


router.get('/home', redirectLogin, function (req, res) {
    res.send("Hello world test")                                                              
});



    




module.exports = router;

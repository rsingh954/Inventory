var Category = require('../models/category');
let officeItem = require('../models/officeItem');

// const { body,validationResult } = require('express-validator/check');
// const { sanitizeBody } = require('express-validator/filter');


let async = require('async');

exports.index = function(req, res, next) {
  Category.find()
  .exec(function(err, results){
    if(err){return next(err)}
    console.log(results)
    res.render('cat_list', {title: "Office Market", list: results})
  })
}



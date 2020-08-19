var Category = require("../models/category");
let officeItem = require("../models/officeItem");
let async = require("async");

const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");
const { off } = require("../models/category");


exports.item_detail = function(req, res, next){
  officeItem.find().where({_id:req.params.id})
  .exec(function(err, result){
    if(err){ return next(err)};
    res.render('item_detail',{ title: "List", items: result});
  });
};



exports.item_list = function(req, res, next){
  officeItem.find()
  .populate('item')
  .exec(function(err, results){
    res.render("item_list", { title: "List", err: err, items: results });
  })
};



exports.office_detail = function (req, res, next) {
  officeItem
    .find({ category: req.params.id })
    .populate("item")
    .exec(function (err, item_list) {
      if (err) {
        return next(err);
      }
      res.render("item_list", { title: "List", err: err, items: item_list });
    });
};

// Display item create form on GET.
exports.office_create_get = function (req, res, next) {
  console.log({req})
  async.parallel(
    {
      category: function (callback) {
        Category.find(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render("item_form", {
        title: results.category.name,
        err: err,
        categories: results.category,
      });
    }
  );
};

exports.office_create_post = [
  // Convert the categories to an array.
  (req, res, next) => {
    if (!(req.body.category instanceof Array)) {
      if(req.body.category == null){req.body.category = '5f3af3b4e25521a44ee0342d'};//default is office supplies
      if (typeof req.body.category === "undefined") req.body.category = [];
      else req.body.category = new Array(req.body.category);
    }
    next();
  },

  // Validate fields.
  body("name", "Name must not be empty.").trim().isLength({ min: 1 }).custom((value, {req}) => {
    return new Promise((resolve, reject) =>{
      officeItem.findOne({name: req.body.name}, function(err, name){
        if(err){
          reject(new Error('Server Error'))
        }
        if(Boolean(name)){
          reject(new Error("Item name already taken"))
        }
        resolve(true)
      });
    });
  }),
  body("description", "Description must not be empty.").trim().isLength({ min: 1 }),
  body("price", "PLease set a price.").trim().isLength({ min: 1 }),
  body("stock", "Enter quantity available.").trim().isLength({ min: 1 }).withMessage('Please enter a number'),

  sanitizeBody("*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    const errors = validationResult(req);

    let item = new officeItem({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      stock: req.body.stock,
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          category: function (callback) {
            Category.find(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          };

          // Mark our selected categories as checked.
          for (let i = 0; i < results.category; i++) {
            if (item.category.indexOf(results.category[i]._id) > -1) {
              results.category[i].checked = "true";
            }
          };
          res.render("item_form", {
            title: 'Create Item',
            err: err,
            categories: results.category,
            item: item,
            errors: errors.array(),
          });
        });
          return;
    }else{
     // Data from form is valid. Save book.
     item.save(function (err) {
       if (err) { return next(err); }
          //successful - redirect to new book record.
          res.redirect('/catalog');
       });
    }
  },
];
// Display item delete form on GET.
exports.item_delete_get = function(req, res, next) {

  async.parallel({
      item: function(callback) {
          officeItem.findById(req.params.id).exec(callback);
      },
  }, function(err, results) {
      if (err) { return next(err); }
      if (results.item==null) { // No results.
          res.redirect('/catalog');
      };
      // Successful, so render.
      res.render('item_delete', { title: 'Delete Item', item: results.item } );
  });
};

// Handle book delete on POST.
exports.item_delete_post = function(req, res, next) {
  // Assume the post has valid id (ie no validation/sanitization).
  officeItem.findByIdAndRemove(req.params.id, function deleteItem(err){
    if(err) {return next(err)}
    res.redirect('/catalog/items')
  })
};

exports.item_update_get = function(req, res, next){
  async.parallel({
    item: function(callback){
      officeItem.findById(req.params.id).populate('item').exec(callback)
    },
    category: function (callback) {
      Category.find(callback);
    },
  }, function(err, results){
    if(err){ return next(err) };
    if(results.item==null){
      let err = new Error('Item not found')
      err.status = 404;
      return next(err);
    }
    res.render("item_form", {
      title: results.category.name,
      err: err,
      categories: results.category,
    });
  });
};

exports.item_update_post = [
  (req, res, next) => {
    if (!(req.body.category instanceof Array)) {
      if (typeof req.body.category === "undefined") req.body.category = [];
      else req.body.category = new Array(req.body.category);
    }
    next();
  },

   // Validate fields.
   body("name", "Name must not be empty.").trim().isLength({ min: 1 }),
   body("description", "Description must not be empty.").trim().isLength({ min: 1 }),
   body("price", "PLease set a price.").trim().isLength({ min: 1 }),
   body("stock", "Enter quantity available.").trim().isLength({ min: 1 }),
 
   sanitizeBody("*").escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);      

      let item = new officeItem({
        name: req.body.name,
        description: req.body.description,
        category: (typeof req.body.category==='undefined') ? [] : req.body.category,
        price: req.body.price,
        stock: req.body.stock,
        _id: req.params.id
      });

      if(!errors.isEmpty()){


        async.parallel({
          items: function(callback){
            officeItem.findById(req.params.id);
          },
          categories: function (callback) {
            Category.find(callback);
          },
        }, function(err, results){
          if (err) { return next(err); }

          for (let i = 0; i < results.categories.length; i++) {
            if (item.category.indexOf(results.categories[i]._id) > -1) {
                results.categories[i].checked='true';
            }
          }
          res.render('item_form', { title: 'Update Item',item: results.items, categories: results.categories, errors: errors.array() });
      });
      return;
    }
    else{
      // Data from form is valid. Update the record.
      officeItem.findByIdAndUpdate(req.params.id, item, {}, function (err,theitem) {
      if (err) { return next(err); }
      // Successful - redirect to book detail page.
      console.log(theitem.url)
      res.redirect('/catalog'+theitem.url);
      });
    }
  }
];
let userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
let async = require('async')
let Item = require('../inventory-application/models/officeItem')
let Category = require('../inventory-application/models/category')

let categories = [];
let items = []
let mongoose = require('mongoose');
let mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));



function createCategroy(name, description, cb){
  cat = {
    name: name,
    description: description
  }

  let category = new Category(cat);
  category.save(function(err){
    if(err){
      cb(err, null)
      return
    }
    console.log('New Category: ' + category);
    categories.push(category)
    cb(null, err)
  });
};

function addCategory(cb){
  async.parallel([
    function(callback){
      createCategroy("Office Supplies", "Browse our office supplies", callback)
    },
    function(callback){
      createCategroy("Office Furniture", "Browse office furniture", callback)
    },
    function(callback){
      createCategroy("Office Technology", "Browse our technologies", callback)
    },
  ], cb)
}


function itemCreate(name, description, category, price,stock, cb){
  itemDetail = {
    name: name,
    description:description,
    price:price,
    stock:stock
  };

  if(category != false) itemDetail.category = category

  let item = new Item(itemDetail);

  item.save(function(err){
    if(err){
      cb(err, null);
      return
    }
    console.log('New item: ' + item);
    items.push(item)
    cb(null, item)
  });
}

function createItems(cb){
  async.parallel([
    function(callback){
      itemCreate('Keyboard', 'small keyboard wireless',[categories[0].id,],29, 20, callback)
    },
    function(callback){
      itemCreate('Desk', 'small coffee desk',[categories[1].id,],15, 10, callback)
    }
  ], cb)
}

async.series([
  addCategory,
  createItems
],
// Optional callback
function(err, results) {
  if (err) {
      console.log('FINAL ERR: '+err);
  }
  else {
      console.log('BOOKInstances: '+items);
      
  }
  // All done, disconnect from database
  mongoose.connection.close();
});



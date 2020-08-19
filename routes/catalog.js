let express = require('express');
let router = express.Router();
let categoryController = require('../controllers/categoryController')
let itemController = require('../controllers/itemController')


/* GET home page. */
router.get('/', categoryController.index);

//GET create Item page
router.get('/item/create', itemController.office_create_get);

//POST request for creating Item
router.post('/item/create', itemController.office_create_post);

// GET request to delete Item.
router.get('/item/:id/delete', itemController.item_delete_get);

// POST request to delete Item.
router.post('/item/:id/delete',itemController.item_delete_post);


//GET item update page
router.get('/item/:id/update', itemController.item_update_get);

//POST item update page
router.post('/item/:id/update', itemController.item_update_post);


//GET item detail page
router.get('/item/:id', itemController.item_detail)

//GET list of all items
router.get('/items', itemController.item_list);

//GET office supply overview page
router.get('/:id',itemController.office_detail );

module.exports = router;
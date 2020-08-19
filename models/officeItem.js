let mongoose = require('mongoose');
let Schema = mongoose.Schema;


let officeItemSchema = new Schema({
  name: {type: String, required: true, maxlength:70},
  description: {type: String, required: true},
  category:{type: Schema.Types.ObjectId, ref: 'Category', required:true},
  price:{type: Number, min:1, required: true },
  stock: {type: Number, min:0, required: true },
  img_url: String,
})

officeItemSchema
.virtual('url')
.get(function () {
  return '/item/' + this._id;
});


//Export model
module.exports = mongoose.model('Item', officeItemSchema);
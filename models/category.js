let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let CategorySchema = new Schema(
  {
    name: {type: String, required: true},
    description: {type: String, required: true},
    img_url: {type: String}
  }
);

// Virtual for Category url
CategorySchema
.virtual('url')
.get(function () {
  return '/catalog/category/' + this._id;
});

CategorySchema
.virtual('fname')
.get(function () {
  const URL = this.name
  .split(" ")
  .map((word) => word.toLowerCase())
  .join("-")
 return URL;
});
  
  
//Export model
module.exports = mongoose.model('Category', CategorySchema);
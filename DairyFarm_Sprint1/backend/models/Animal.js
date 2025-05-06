const mongoose = require('mongoose');

const AnimalSchema = new mongoose.Schema({
  name: String,
  breed: String,
  age: Number
});

module.exports = mongoose.model('Animal', AnimalSchema);
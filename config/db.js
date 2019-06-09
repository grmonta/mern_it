const mongoose = require('mongoose');
const config = require('config');

//to access variables in config file
const db = config.get('mongoURI');

//to connect to mongoDB in an async function
//with a try catch to catch a fail

const connectDB = async () => {
  try {
    await mongoose.connect(db);
    console.log('MongoDB Connected..');
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;

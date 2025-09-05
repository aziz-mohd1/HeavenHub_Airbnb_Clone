// index.js file
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listings.js");

// settingUp mongoose
main()
  .then((res) => {
    console.log("Connected to DB!");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/HeavenHub");
}

const initDB = async () => {
  await Listing.deleteMany({});
  
  // adding owner for every listing
  //When to Use Parentheses () Instead of Braces {} : "below we have used new synyax for arrow function ()=>() instead of ()=>{}"
  // When you return an object literal, you need to wrap the object in parentheses (). This is because curly braces {} are ambiguous in JavaScript: they could be interpreted as a block of code rather than an object.

  initData.data = initData.data.map((obj) => ({ 
    ...obj,
    owner: "67383ef08f1e0285504c82b0",
  }));

  await Listing.insertMany(initData.data);
  // console.log(initData.data);

  console.log("Data was initialized!");
};

initDB();

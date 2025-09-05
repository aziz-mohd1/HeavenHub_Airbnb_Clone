const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js"); //because im using "post" mongoose middle-ware to delete all reviews if its listing is deleted WHEN A DELETE REQUEST IS MADE..
const { required } = require("joi");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    filename: String,
  },
  price: Number,
  location: String,
  country: String,

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review", // that means this field is referencing the id of the /review.js document
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User", // that means this field is referencing the id of the /user.js document
  },
  geometry: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ["Point"], // 'location.type' must be 'Point'
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

// using mongoose post middleware which will delete all corresponding reviews when a listing is deleted WHEN A DELETE REQUEST IS MADE..

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) await Review.deleteMany({ _id: { $in: listing.reviews } });
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;

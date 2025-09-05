const Review = require("../models/review.js");
const Listing = require("../models/listings.js");

module.exports.createReview = async (req, res) => {
  // console.log(req.params.id);
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);

  newReview.author = req.user._id;
  // console.log(listing);
  // console.log(newReview);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  req.flash("success", "New Review Created!");
  res.redirect(`/listings/${listing._id}`); //either (listing._id) or (req.params.id) for getting id of particular listing both same.

  //*** wrapAsync will handle the errors without letting the server crash but it will display the error on some other page.
  //*** thats why we are using try-catch to flash the message within that page if error occurred..!
};

module.exports.destroyReview = async (req, res) => {
  let { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review Deleted!");
  res.redirect(`/listings/${id}`); //either (listing._id) or (req.params.id) for getting id of particular listing both same.
};

// for my revision reference im writing this.... findByIdAndDelete() will call mongoose findOneAndDelete() -- revise mongoose docs..
// ***** using mongoose "post" middleware in /models/listing.js which will delete all corresponding reviews when a listing is deleted WHEN A DELETE REQUEST IS MADE.. *****

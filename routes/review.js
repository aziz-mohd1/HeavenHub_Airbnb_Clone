const express = require("express");
const router = express.Router({ mergeParams: true }); // using this option we can create new review folder 54. project2(phase-b) video-2
const wrapAsync = require("../utils/wrapAsync.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

// using MVC architecture (todays date 22 Nov 2024)
const reviewController = require("../controllers/reviews.js");

// Reviews
// Post Review Route
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview)
);

// Delete Review Route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;

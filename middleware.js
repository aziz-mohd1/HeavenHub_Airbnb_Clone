const Listing = require("./models/listings.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){ //isAuthenticated() is a passport inbuilt method to check weather the user is logged-in or not
        // redirect URL
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged-in to create listing!");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl ;
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(listing && !listing.owner._id.equals(res.locals.currUser._id)){
      req.flash("error", "You are not the owner of this listing!");
      return res.redirect(`/listings/${id}`);
    }
    next();
}

// Joi
function validateSchema(schema) {
    return (req, res, next) => {
        let { error } = schema.validate(req.body);
        if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
        } else next();
    };
}

module.exports.validateListing = validateSchema(listingSchema);
module.exports.validateReview = validateSchema(reviewSchema);


module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
      req.flash("error", "You are not the author of this review!");
      return res.redirect(`/listings/${id}`);
    }
    next();
}



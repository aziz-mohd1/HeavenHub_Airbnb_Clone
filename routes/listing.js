const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

// using MVC architecture (todays date 22 Nov 2024)
const listingController = require("../controllers/listings.js");
const multer = require("multer");

const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// using router.route (todays date 22 Nov 2024)
router
  .route("/")
  .get(wrapAsync(listingController.index)) // Index Route --> READ
  .post(
    // CREATE new listing to db
    isLoggedIn,
    upload.single("listing[image]"),         // multer middleware to handle file upload
    validateListing,
    wrapAsync(listingController.createListing)
  );
/*
  Summary:
  Always define more specific routes before more general routes. eg: "/new" should be before "/:id" path
  This practice helps avoid unexpected behavior and ensures that your routerlication responds correctly to requests.
*/

// NEW route listings  --> IT SHOULD BE ABOVE THE SHOW ROUTE else throwing error..
router.get("/new", isLoggedIn, wrapAsync(listingController.renderNewForm));

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing)) // SHOW individal listing route
  .put(
    // UPDATE listing
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),         // multer middleware to handle file upload
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(
    // DESTROY/DELETE listing
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing)
  );

// EDIT listing
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;

/*
  Explanation of new:
  Creating a New Instance: The new keyword is used to create a new instance of the Listing model. This means you are creating a new object that conforms to the structure defined by your Listing schema in MongoDB.
  
  Using the Model: When you use new Listing(...), it tells MongoDB that you want to create a new document in the corresponding collection. In this case, it creates a new listing object with the data you provide from req.body.listing.
  
  Is new Necessary?
  Yes, the new keyword is necessary here. Without it, you wouldn't be creating a new instance of the Listing model. Instead, you would just be trying to call the constructor function, which wouldn't have the intended effect of instantiating an object.
  
  Summary:
  Use new: You must use the new keyword to create an instance of your Mongoose model.
  Creating Documents: This is essential when you want to create a new document in your MongoDB database.
*/

/*  Adding can be done this way also, this is from my MONGO3 FOLDER...
  // ADD chats to page and DB
  router.post("/chats", (req, res) => {
    let { from, message, to } = req.body;
  
    let newChat = new Chat({
      from: from,
      message: message,
      to: to,
      created_at: new Date(),
    });
  
    newChat
      .save()
      .then((res) => console.log("New chat saved, Success!"))
      .catch((err) => console.log(`Error while saving new chat ${err}`));
  
    res.redirect("/chats");
  });
*/

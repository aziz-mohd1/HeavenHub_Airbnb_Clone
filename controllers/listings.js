const axios = require("axios");
const Listing = require("../models/listings.js");
const { response } = require("express");

module.exports.index = async (req, res, next) => {
  const allListings = await Listing.find();
  res.render("./listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  // console.log(req.user);
  res.render("./listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    }) //populate() will get all reviews of each listing having 1:n relationship
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  // console.log(listing);

  res.render("./listings/show.ejs", { listing });
};

// module.exports.createListing = async (req, res, next) => {
//   // let {title, description, image, price, location, country} = req.body;  // or
//   let url  = req.file.path;
//   let filename = req.file.filename;

//   let 

//   // console.log(url, "..", filename);
//   let newListing = new Listing(req.body.listing);
//   newListing.owner = req.user._id; // add owner to listing
//   newListing.image = {url, filename};
//   await newListing.save();
//   req.flash("success", "New Listing Created!");
//   return res.redirect("/listings");
// };

module.exports.createListing = async (req, res, next) => {
  try {
    const { location } = req.body.listing; 
    const url = req.file?.path;
    const filename = req.file?.filename;

    let coordinates = [];

    try {
      // Use Nominatim API for geocoding
      const geocodeResponse = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: location || "",
          format: "json",
          addressdetails: 1,
          limit: 1,
        },
      });

      if (geocodeResponse.data.length > 0) {
        const { lat, lon } = geocodeResponse.data[0];
        coordinates = [parseFloat(lon), parseFloat(lat)];
      } else {
        console.warn("Could not find location coordinates:", location);
      }

    } catch (geoError) {
      //  Catch geocoding errors but do NOT throw
      console.error("Geocoding failed:", geoError.message);
      // leave coordinates empty, fallback will be used
    }

    // Create the listing
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    if (url && filename) newListing.image = { url, filename };

    // Save coordinates if available
    newListing.geometry = { type: "Point", coordinates };

    await newListing.save();

    req.flash("success", "New Listing Created!");
    return res.redirect("/listings"); //  single response guaranteed

  } catch (err) {
    console.error("Error creating listing:", err.message);

    // ✅ Only send one response
    if (!res.headersSent) {
      req.flash("error", "Failed to create listing. Please try again.");
      return res.redirect("/listings/new");
    }
  }
};



module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if(!listing){
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  // originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("./listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });  //updated listing
  
  // Get the new location from the form input
  const { location } = req.body.listing;
  // console.log(req.body.listing);
  
  // If the location has been changed, re-geocode it
  if (location && location !== listing.location) {
    try {
      // Use the Nominatim API to get the new coordinates
      const geocodeResponse = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: location,
          format: "json",
          addressdetails: 1,
          limit: 1,
        },
      });

      // Check if geocoding returned results
      if (geocodeResponse.data.length === 0) {
        req.flash("error", "Could not find coordinates for the new location. Please try again.");
        return res.redirect(`/listings/${id}/edit`);
      }

      // Extract latitude and longitude from the geocoding response
      const { lat, lon } = geocodeResponse.data[0];
      const coordinates = [parseFloat(lon), parseFloat(lat)];

      // Update the location and geometry fields
      listing.location = location;
      listing.geometry = { type: "Point", coordinates };

    } catch (error) {
      console.error("Error during geocoding:", error.message);
      req.flash("error", "Failed to update location. Please try again.");
      return res.redirect(`/listings/${id}/edit`);
    }
  }


  if(typeof req.file !== "undefined"){
    let url  = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
  }

  

  await listing.save();
  // console.log(editedListing);  //edited!
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  // console.log(deletedResponse);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

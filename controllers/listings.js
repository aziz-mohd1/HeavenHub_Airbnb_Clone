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
    const { location } = req.body.listing; // Extract location from the form
    const url = req.file.path;
    const filename = req.file.filename;

    // Use Nominatim API for geocoding the location
    const geocodeResponse = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: location,
        format: "json",
        addressdetails: 1,
        limit: 1,
      },
    });

    // Check if geocoding results are returned
    if (!geocodeResponse.data.length) {
      req.flash("error", "Could not find location coordinates. Please try again.");
      return res.redirect("/listings/new");
    }

    // Extract latitude and longitude from the geocoding API response
    const { lat, lon } = geocodeResponse.data[0];
    const coordinates = [parseFloat(lon), parseFloat(lat)];

    // console.log(geocodeResponse.data[0]);
    // res.send("done!");
    
    // Create a new listing and save the geocoded coordinates
    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; // Add owner to listing
    newListing.image = { url, filename };

    newListing.geometry = { type: "Point", coordinates }; // Save coordinates in 'geometry' field

    console.log(newListing);
    
    await newListing.save();
    
    req.flash("success", "New Listing Created!");
    return res.redirect("/listings");
  } catch (error) {
    console.error("Error during geocoding:", error.message);
    req.flash("error", "Failed to create listing. Please try again.");
    return res.redirect("/listings/new");
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

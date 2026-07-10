const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const mongoose = require("mongoose");
const maptilerClient = require("@maptiler/client");
// MapTiler is a mapping platform that provides APIs for working with maps
// and geographic data. We'll use its Geocoding API to convert a location
// name into geographic coordinates (longitude and latitude).
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;
// Setting the API key used to authenticate requests to MapTiler.

// dont have to require dotenv here, since we are doing that in app.js,
// so every file that app.js requires directly or indirectly has the same process object

// Controllers
module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.newFormCampground = async (req, res) => {
  // console.log(req.user);
  res.render("campgrounds/new");
};

module.exports.showCampground = async (req, res) => {
  const { id } = req.params;
  // checking if the campground id is not valid mongo objectID, (should be 24 characters)
  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash("error", "Campground not found!");
    return res.redirect("/campgrounds");
  }
  const campground = await Campground.findById(id)
    .populate({
      path: "reviews", // populating reviews which is the path inside campground.
      populate: {
        // then inside that reviews populate author defined below.
        path: "author", // this allows us to poulate nested objects, using path and populate passted as an object
      },
    })
    .populate("author");
  if (!campground) {
    req.flash("error", "Campground not found!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

module.exports.newCampground = async (req, res) => {
  // checking if the input object is empty
  if (!req.body.campground) {
    throw new ExpressError("Invalid Input", 400);
  }
  // this method Converts a place name or address → coordinates.
  const geoData = await maptilerClient.geocoding.forward(
    req.body.campground.location,
    { limit: 1 }, // returns only 1st (best matching result) in features array
  );

  // Optional chaining (?.):
  // If `geoData.features` exists, check its length.
  // Otherwise, return `undefined` instead of throwing an error. and this block runs!
  // If the length is 0, this block runs.
  if (!geoData.features?.length) {
    req.flash(
      "error",
      "Could not geocode that location. Please try again and enter a valid location.",
    );
    return res.redirect("/campgrounds/new");
  }

  const data = req.body.campground;
  const newCamp = new Campground(data);

  // geometry contains geoJSON formated data
  // which is geographic data just in strict format!
  // we store it as it is in mongo!
  // to use mongos geospatial features!
  newCamp.geometry = geoData.features[0].geometry;
  // setting location to the fetched or retrieved location to the corresponding cordinates
  newCamp.location = geoData.features[0].place_name;

  // returns an array of objects containing filename and url
  newCamp.images = req.files.map((f) => ({
    filename: f.filename,
    url: f.path,
  }));

  newCamp.author = req.user._id; // adding the user._id to the author property before saving in DB
  // this stores the objectID to author in campground model. which we can then populate
  await newCamp.save();
  req.flash("success", "Successfully ceated a campground!");
  res.redirect(`/campgrounds/${newCamp._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted a campground!");
  res.redirect("/campgrounds");
};
module.exports.updateFormCampground = async (req, res) => {
  const { id } = req.params;
  const camp = await Campground.findById(id);
  res.render("campgrounds/edit", { camp });
};

module.exports.updateCampground = async (req, res) => {
  // console.log(req.body);
  const { id } = req.params;
  const geoData = await maptilerClient.geocoding.forward(
    req.body.campground.location,
    { limit: 1 },
  );

  if (!geoData.features?.length) {
    req.flash(
      "error",
      "Could not geocode that location. Please try again and enter a valid location.",
    );
    return res.redirect(`/campgrounds/${id}/edit`);
  }

  const images = req.files.map((f) => ({ filename: f.filename, url: f.path }));
  const updatedCamp = await Campground.findByIdAndUpdate(
    id,
    {
      ...req.body.campground,
      $push: {
        // Appending new uploaded images to the existing `images` array
        // `$each` tells MongoDB to push every object in the `images` array,
        // instead of pushing the entire array as a single element.
        images: {
          $each: images,
        },
      },
    },
    { runValidators: true, new: true },
  );
  // updatedCamp.images.push(...images); can do it like this. easier method (not optimized)
  // await updatedCamp.save();

  // geometry contains geoJSON formated data
  // which is geographic data just in strict format!
  // we store it as it is in mongo!
  // to use mongos geospatial features!
  updatedCamp.geometry = geoData.features[0].geometry;

  updatedCamp.location = geoData.features[0].place_name;
  updatedCamp.save();
  if (req.body.deleteImages) {
    // here filename is each element of req.body.deleteImages
    // which is an array of filename!
    // so filename is each delete images filename!
    for (const filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename); // deleting images from cloudinary
      // cloudinary.uploader.destroy(filename) removes the file from cloudinary
      // by calling Cloudinary API internally, we just need to use the cloudinary SDKs method
      // which we just used!
    }
    await updatedCamp.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
    // deleting images from mongo
  }
  req.flash("success", "Successfully updated a campground!");
  res.redirect(`/campgrounds/${id}`);
};

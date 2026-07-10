const express = require("express");
const Campground = require("../models/campground");
const router = express.Router();
const mongoose = require("mongoose");
const { isLoggedIn, validationCampground, isAuthor } = require("../middleware");
const { storage } = require("../cloudinary"); // requiring index.js imports which is (storage and cloudinary)
const multer = require("multer"); // requiring
const upload = multer({ storage }); // configuring, dest referes to destination
// Configure Multer middleware.
// Uploaded files will be stored in the "uploads/" directory. or the storage object ( cloudinary )

// We need to use enctype="multipart/form-data" when uploading files
// so the browser can send binary data (files) along with normal text form fields.
// The default application/x-www-form-urlencoded format only supports text form data,
// so Express's express.urlencoded() cannot parse file uploads.

// We use the Multer package to parse multipart/form-data.
// It is used as middleware and makes the uploaded files available
// on req.file/req.files and the text fields on req.body.
const {
  index,
  newFormCampground,
  showCampground,
  newCampground,
  deleteCampground,
  updateFormCampground,
  updateCampground,
} = require("../controllers/campgrounds");

// router.route() is a method used to group multiple hhtp verbs/methods for a single url
router
  .route("/")
  .get(index)
  .post(
    isLoggedIn,
    upload.array("campground[images]"),
    validationCampground,
    newCampground,
  );

// upload.array("fieldname (same as "name" in input name) is a multer middleware,
// used to parse multiple files and attach their details, to req.files.
// upload.single("same as above") is also a multer middleware,
// used to parse single file, attach its detials to req.file
// .post(upload.array("campground[images]"), (req, res) => {
//   res.send("yay!");
//   console.log(req.body, req.files);
// });

router.get("/new", isLoggedIn, newFormCampground);

router
  .route("/:id")
  .get(showCampground)
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("campground[images]"),
    validationCampground,
    updateCampground,
  );

router.get("/edit/:id", isLoggedIn, isAuthor, updateFormCampground);

router.delete("/:id", isLoggedIn, isAuthor, deleteCampground);

module.exports = router;

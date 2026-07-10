const express = require("express");
const Campground = require("../models/campground");
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError");
const router = express.Router({ mergeParams: true });
// mergeParams: true :-
// Makes parent route params (like :id) available in this router's req.params
// which is not present by default it has only this file router params!
const { reviewValidationSchema } = require("../schemas");
const {
  validationReview,
  isLoggedIn,
  isReviewAuthor,
} = require("../middleware");
const { newReview, deleteReview } = require("../controllers/reviews");

router.post("/", isLoggedIn, validationReview, newReview);

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, deleteReview);

module.exports = router;

const Campground = require("../models/campground");
const ExpressError = require("../utils/ExpressError");
const Review = require("../models/review");
module.exports.newReview = async (req, res) => {
  const { id } = req.params;
  const camp = await Campground.findById(id);
  const rev = new Review(req.body.review);
  rev.author = req.user._id;
  camp.reviews.push(rev);
  await rev.save();
  await camp.save();
  // console.log(camp);
  req.flash("success", "Successfully created a review!");
  res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteReview = async (req, res) => {
  // res.send("DELETE");
  const { id, reviewId } = req.params;
  const rev = await Review.findByIdAndDelete(reviewId);
  const camp = await Campground.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });
  req.flash("success", "Successfully deleted a review!");
  res.redirect(`/campgrounds/${id}`);
};

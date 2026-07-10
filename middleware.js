const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/campground");
const Review = require("./models/review");
const {
  campgroundValidationSchema,
  reviewValidationSchema,
} = require("./schemas");

const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // isAuthenticated is a method attached to every req by passport for us
    // it checks if the user is authenticated (logged in)or not, returns true or false
    req.session.returnTo = req.originalUrl; // storing orignal url from where we redirected to login
    // storing in session
    req.flash("error", "Login is required!");
    return res.redirect("/auth/login");
  }
  next();
};
const storeReturnTo = async (req, res, next) => {
  if (req.session.returnTo) {
    // now storing it in res.locals from the session
    // since session will be cleared after login ( thats how passport works)
    // and we cant store in res.locals in the above middleware
    // bcoz res.locals will be gone since req res cycle will be completed
    //  req and res objects exists only for the current cycle of req res.
    // after that cycle the data in it will be gone
    // on every new request a new req and res object is created, hence we wont have that res.locals if we defined it above
    // now we will use THIS middleware, before passport.authenticate middleware
    res.locals.returnTo = req.session.returnTo;
    return next();
  }
  next();
};
const validationCampground = (req, res, next) => {
  // either use req.body if its truthy, else use the right value - {}
  // we are doing this so that req.body is not empty which will result in undefined
  // causing our validations to get messed up since they will get skipped bcoz
  // our parent object is not required, but it is supposed to be an object
  const dataToValidate = req.body || {};
  // .validate() checks actual data(req.body) against the Joi schema rules.
  const { error } = campgroundValidationSchema.validate(dataToValidate);
  // "Check if req.body follows the schema rules"
  // .validate() returns an object containing:
  // validated value
  // validation error (if any)
  // if not then it produces error, which we cheecked for here below,
  // if error is truthy then, throw error, otherwise just continue using next().
  if (error) {
    const errorMsg = error.details.map((el) => el.message);
    // returns an array containing error message. if we use .join on above line of code it becomes a string!
    // but since we are passing this errorMsg to error class below,
    // we dont have to convert it to string since Error class automatically does it internally
    // and also we are not joining since by default Joi stops at the first validation error.
    // we can set {abortEarly : false} in .validate() second paramter. which stops this default behaviour
    // then using join() would make sense!
    // console.log(errorMsg); // returns an array containing error msg

    req.flash("error", errorMsg);
    return res.redirect(req.get("Referer"));
    // Redirect back to the page (url) that initiated (sent) the current request.
    // throw new ExpressError(errorMsg, 400);
  } else {
    next();
  }
};
const isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You don't have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

const isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You don't have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

const validationReview = (req, res, next) => {
  const { id } = req.params;
  // either use req.body if its truthy, else use the right value - {}
  // we are doing this so that req.body is not empty which will result in undefined
  // causing our validations to get messed up since they will get skipped bcoz
  // our parent object is not required, but it is supposed to be an object
  const dataToValidate = req.body || {};
  const { error } = reviewValidationSchema.validate(dataToValidate);
  // console.log(error);
  if (error) {
    const errorMsg = error.details.map((el) => el.message).join(", ");
    req.flash("error", errorMsg);
    return res.redirect(`/campgrounds/${id}`);
    // throw new ExpressError(errorMsg, 400);
  } else {
    next();
  }
};

module.exports.isLoggedIn = isLoggedIn;
module.exports.isAuthor = isAuthor;
module.exports.isReviewAuthor = isReviewAuthor;
module.exports.validationCampground = validationCampground;
module.exports.storeReturnTo = storeReturnTo;
module.exports.validationReview = validationReview;

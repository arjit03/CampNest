const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } };
// allows virtual fields to be included when a Mongoose document is converted to JSON
// (e.g., when using JSON.stringify() or res.json()).
// we pass this object as the second argument when creating the schema
// the second argument is options object, which takes options regarding that schema

const imageSchema = new Schema({
  filename: { type: String },
  url: { type: String },
});

imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
  // defining a virtual property on imageschema
  // since we can only define virtual properties directly on the schema
  // we seperate imageschema and then used in the campgrounds images
  // we are defining this virtual property bcoz we need thumbnail size images from cloudinary
  // to do that we need to alter the image urls, by chanin on w_200 on the url after upload/{HERE!}
  // cloudinary api allows us to change sizes dynamically through urls by adding properties (eg w_200)
});

const campgroundSchema = new Schema(
  {
    name: String,
    price: Number,
    images: {
      type: [
        imageSchema, // using above define imageSchema
        // {
        //   // filename: { type: String },
        //   // url: { type: String },
        // },
      ],
    },
    geometry: {
      // geoJSON format, we use this to store geometric data
      // so that we can use mongoDBs geospatials features ( operators )
      // here point refers to a single location, we can have different types of these!
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    description: String,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts, // passing options object we defined above
);

//deleting reviews that exist on the deleted camprgound
// using mongoose middleware!
campgroundSchema.post("findOneAndDelete", async (camp) => {
  if (camp && camp.reviews.length) {
    // if we delete a campground and that campground has reviews! then delete them!
    const Review = require("./review");
    await Review.deleteMany({ _id: { $in: camp.reviews } });
  }
});

// creating a virtual property
// used to render the link , name and description of the campground on popup marker on map
// "this" here refers to the individual campground!
campgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `
    <strong><a href="/campgrounds/${this._id}">${this.name}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`;
});

module.exports = mongoose.model("Campground", campgroundSchema);

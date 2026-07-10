const Campground = require("../models/campground");
const mongoose = require("mongoose");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config(); // requiring the dotenv module we installed (npm i dotenv)
  // and using its .config() method, which attaches key value pairs inside the .env file to process.env.
  // basically parses it.
}

mongoose.connect(process.env.DB_URL);
mongoose.connection.on("error", (err) => {
  console.log("Error :", err);
});
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

const seed = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  try {
    await Campground.deleteMany({});

    for (let i = 0; i < 50; i++) {
      const price = Math.floor(Math.random() * 20 + 10);
      const random1000 = Math.floor(Math.random() * 1000);
      const camp = new Campground({
        location: `${cities[random1000].city}, ${cities[random1000].state}`,
        geometry: {
          type: "Point",
          coordinates: [
            cities[random1000].longitude,
            cities[random1000].latitude,
          ],
        },
        author: "6a1d5aec5c99b04d5f0769d4",
        name: `${seed(descriptors)} ${seed(places)}`,
        price,
        description:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorum enim excepturi quas a quibusdam quaerat alias quam possimus, dolorem, incidunt eum nam illum ipsum, et officiis voluptatibus iste! Suscipit, quo.",
        // image: `https://picsum.photos/400?random=${Math.random()}`,
        images: [
          {
            filename: "CampNest/t9gcatxgaqwpadtw7jyg",
            url: "https://res.cloudinary.com/nyglhfc5/image/upload/v1783250519/CampNest/t9gcatxgaqwpadtw7jyg.jpg",
          },
          {
            filename: "CampNest/xpqzp1aqqzj5baehkhxy",
            url: "https://res.cloudinary.com/nyglhfc5/image/upload/v1783250519/CampNest/xpqzp1aqqzj5baehkhxy.jpg",
          },
        ],
      });
      await camp.save();
    }
  } catch (err) {
    console.log(err);
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});

const cloudinary = require("cloudinary").v2;
// requiring the Cloudinary package and accessing its v2 API (recommended version)
const { CloudinaryStorage } = require("multer-storage-cloudinary");
// importing the CloudinaryStorage class, used by Multer to store uploaded files directly in Cloudinary

// defining configurations on .config() method
// cloudname, apu key, api secret etc!
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// this will be used by multer to store the files/images
// contains informations.
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "CampNest",
    allowedFormats: ["jpeg", "png", "jpg"],
  },
});

module.exports = {
  cloudinary,
  storage,
};

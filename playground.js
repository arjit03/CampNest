if (process.env.NODE_ENV !== "production") {
  require("dotenv").config(); // requiring the dotenv module we installed (npm i dotenv)
  // and using its .config() method, which attaches key value pairs inside the .env file to process.env.
  // basically parses it.
}

const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;
const test = async () => {
  const geoData = await maptilerClient.geocoding.forward("paris");
  // this method is used to Convert a place name or address into geographic coordinates (longitude and latitude).
  // returns an object with various details,
  // one of them is features array, that contains property name as geometry that give us cordinates!
  // console.log(geoData);
  console.log(geoData.features[0]);
};
test();

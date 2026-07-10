maptilersdk.config.apiKey = maptilerApiKey; // passed on from show.ejs
// same for campground ( passed on from show.ejs)

const map = new maptilersdk.Map({
  // used to create the map
  container: "map", // rendering the map in this id=map div
  style: maptilersdk.MapStyle.BRIGHT,
  center: campground.geometry.coordinates, // starting position [lng, lat]
  zoom: 10, // starting zoom
});

new maptilersdk.Marker() // creating market on the map
  .setLngLat(campground.geometry.coordinates) // marker location
  .setPopup(
    // setting popup on hover
    new maptilersdk.Popup({ offset: 25 }).setHTML(
      `<h3>${campground.name}</h3><p>${campground.location}</p>`,
      // showing campground name and location on popup
    ),
  )
  .addTo(map); // adding market to the map

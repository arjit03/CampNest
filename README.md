# CampNest

CampNest is a full-stack campground-listing web app in the spirit of Yelp — users can browse campgrounds, view them on a map, and sign up to add their own listings with photos, pricing, and location. Logged-in users can leave star ratings and written reviews on any campground.

**Live demo:** https://camp-nest-five.vercel.app

## Features

- **Authentication** — register/login/logout with Passport.js (local strategy), hashed & salted passwords via `passport-local-mongoose`, persistent sessions stored in MongoDB
- **Campgrounds** — full CRUD (create, read, update, delete), restricted to the logged-in author of a listing
- **Image uploads** — multiple images per campground, uploaded and hosted on Cloudinary via Multer
- **Maps & geocoding** — campground locations are geocoded (via MapTiler) into coordinates, plotted on an interactive cluster map on the campgrounds index page, and on an individual map on each campground's page
- **Reviews** — star ratings and comments, deletable only by their author
- **Validation** — server-side request validation with Joi, plus HTML sanitization on user-submitted text (`sanitize-html`)
- **Flash messages** — success/error feedback via `connect-flash`
- **Custom error handling** — centralized `ExpressError` class and error-handling middleware, with a 404 catch-all

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime / Framework | Node.js, Express 5 |
| Templating | EJS + `ejs-mate` (layouts/partials) |
| Database | MongoDB with Mongoose |
| Auth | Passport.js, `passport-local-mongoose` |
| Sessions | `express-session` + `connect-mongo` (session store) |
| File storage | Cloudinary + Multer (`multer-storage-cloudinary`) |
| Geocoding / maps | MapTiler Client |
| Validation | Joi, `sanitize-html` |
| Deployment | Vercel |

## Project Structure

```
CampNest/
├── app.js                  # App entry point — middleware, sessions, passport, routes
├── controllers/            # Route handler logic (auth, campgrounds, reviews)
├── routes/                 # Express routers
├── models/                 # Mongoose schemas (User, Campground, Review)
├── middleware.js           # isLoggedIn, isAuthor, isReviewAuthor, validation, etc.
├── schemas.js               # Joi validation schemas
├── cloudinary/              # Cloudinary config + Multer storage engine
├── views/                   # EJS templates (auth, campgrounds, partials, layouts)
├── public/                  # Static assets (CSS, client-side JS incl. map scripts)
├── seeds/                   # Scripts to seed the database with sample campgrounds
└── utils/                   # ExpressError helper
```

## Prerequisites

- Node.js
- A MongoDB database (local instance or a hosted one, e.g. MongoDB Atlas)
- A [Cloudinary](https://cloudinary.com/) account (for image uploads)
- A [MapTiler](https://www.maptiler.com/) API key (for geocoding/maps)

## Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/arjit03/CampNest.git
   cd CampNest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the project root with the following:
   ```env
   DB_URL=your_mongodb_connection_string
   SECRET=your_session_secret
   CLOUD_NAME=your_cloudinary_cloud_name
   API_KEY=your_cloudinary_api_key
   API_SECRET=your_cloudinary_api_secret
   MAPTILER_API_KEY=your_maptiler_api_key
   PORT=3000
   ```

4. **(Optional) Seed the database** with sample campgrounds:
   ```bash
   node seeds/index.js
   ```

5. **Run the app**
   ```bash
   npx nodemon app.js
   ```
   The app will be available at `http://localhost:3000`.

## Notes

- `NODE_ENV` controls whether `.env` is loaded — set it to `production` on your host and provide the environment variables through the platform instead (e.g. Vercel's project settings), since `vercel.json` is already included for deployment.
- Password hashing/salting, serialization, and authentication are all handled by `passport-local-mongoose` on the `User` model — no raw passwords are ever stored.

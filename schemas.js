const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const Joi = BaseJoi.extend(extension);
// Joi is used to validate incoming request data before it reaches the database.
// It checks whether req.body follows the structure/rules we define.

// Joi.object() means the incoming value should be a JavaScript object.
// The object inside it defines the expected fields and their validation rules.

// Joi.string() means this field's value must be a string.
// .required() means the field must exist and cannot be empty.

// Joi.number() means the field's value must be a number.
// .min(0) means the number cannot be less than 0.

//min() max() behave differently depending on the type they are attached to.
module.exports.campgroundValidationSchema = Joi.object({
  campground: Joi.object({
    name: Joi.string().required().min(5).max(50).messages({
      "any.required": "Name is required.", // any.required means this field should exist,
      "string.empty": "Name is required.", // string.empty means field is there but it is empty ( empty string )
      "string.min": "Name must be at least 5 characters long.", // string.min means minimum length of string
      "string.max": "Name cannot exceed 50 characters.", // string.max means maximum length of string
    }),

    price: Joi.number().required().min(0).messages({
      "any.required": "Price is required.",
      "number.base": "Price must be a number.",
      "number.min": "Price cannot be negative.",
    }),

    // image: Joi.string().required().messages({
    //   "any.required": "Image URL is required.",
    //   "string.empty": "Image URL is required.",
    // }),

    description: Joi.string().required().min(20).max(999).messages({
      "any.required": "Description is required.",
      "string.empty": "Description is required.",
      "string.min": "Description must be at least 20 characters long.",
      "string.max": "Description cannot exceed 999 characters.",
    }),

    location: Joi.string().required().messages({
      "any.required": "Location is required.",
      "string.empty": "Location is required.",
    }),
  }).required(),
  deleteImages: Joi.array(),
});

// review validation schema which checks -
// if an object review is present in req.body and so on!
module.exports.reviewValidationSchema = Joi.object({
  review: Joi.object({
    body: Joi.string().required().min(1).max(999).messages({
      "any.required": "Review cannot be empty.",
      "string.empty": "Review cannot be empty.",
      "string.max": "Review cannot exceed 999 characters.",
    }),

    rating: Joi.number().required().min(1).max(5).messages({
      "any.required": "Please provide a rating.",
      "number.base": "Rating must be a number.",
      "number.min": "Rating must be at least 1.",
      "number.max": "Rating cannot be greater than 5.",
    }),
  }).required(),
});

const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 50,
    },
    lastName: {
      type: String,
      minlength: 5,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 255,
      unique: true,
    },
    numberOfPeople: {
      type: Number,
      required: true,
      min: 0,
      max: 255,
    },
    checkInDate: {
      type: Date,
      trim: true,
    },
    chekOutDate: {
      type: Date,
      trim: true,
    },
    isDeleted: { 
      type: Boolean, 
      default: false, 
    },
  },
  { timestamps: true }
);

bookingSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      numberOfPeople: this.numberOfPeople,
      checkInDate: this.checkInDate,
      chekOutDate: this.chekOutDate,
    },
    config.get("jwtPrivateKey")
  );
  return token;
};

const Booking = mongoose.model("Booking", bookingSchema);

function validateBooking(booking) {
  const schema = {
    firstName: Joi.string().min(5).max(50).required(),
    lastName: Joi.string().required(),
    email: Joi.string().min(5).max(255).required().email(),
    numberOfPeople: Joi.number().min(0).required(),
    checkInDate: Joi.date().iso().required(),
    chekOutDate: Joi.date().iso().greater(Joi.ref("checkInDate")).required()
  };
  return Joi.validate(booking, schema);
}

exports.Booking = Booking;
exports.validate = validateBooking;

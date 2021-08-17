const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const config = require("config");
const _ = require("lodash");
const { Booking, validate } = require("../models/booking");
//const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

function datediff(fromDate, todate) {  
  // Round to nearest whole number to deal with DST.
  return Math.round((todate-fromDate)/(1000*60*60*24));
}

router.post("/", async (req, res) => {
  console.log("we are here");
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const { email, checkInDate, chekOutDate, numberOfPeople } = req.body;
  if(numberOfPeople > 2) {
    return res.status(400).send("You can book up to 3 people !.");
  }

  let numberOfdays = datediff(new Date(chekOutDate),new Date(checkInDate));

  if(numberOfdays > 3) {
    return res.status(400).send("You can book up to 3 days !.");
  }

  let book = await Booking.findOne({
    email: email,
    checkInDate: { $gte: new Date(checkInDate), $lt: new Date(chekOutDate) },
  });
  console.log("book", book);
  if (book) return res.status(400).send("User already booked.");

  book = new Booking(
    _.pick(req.body, [
      "firstName",
      "lastName",
      "email",
      "numberOfPeople",
      "checkInDate",
      "chekOutDate",
    ])
  );
  try {
    await book.save();
  } catch (err) {
    console.log(err);
  }
  const token = book.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(book, ["_id", "name", "email"]));
});

router.get("/me", async (req, res) => {
  console.log(req.query);
  const { email } = req.query;
  const booked = await Booking.find({ email: email, isDeleted: true });

  if (booked.length > 0) {
    res.send();
    res.status(200).json({
      data: booked,
      message: "Successfully ",
      status: true,
    });
  } else {
    res.status(400).json({
      message: " No record found for this email ",
      status: false,
    });
  }
});

router.delete("/", async (req, res) => {
  console.log(req.query);
  const { id } = req.query;
  Booking.findOneAndUpdate(
    {
      _id: id,
    },
    {
      $set: {
        isDeleted: true,
      },
    }
  )
    .then((data) => {
      console.log(data);
      res.status(200).json({
        data: data,
        message: "Booking deleted Successfully!",
        status: true,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({
        message: " Something went wrong ! ",
        status: false,
      });
    });  
});

module.exports = router;

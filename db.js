const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.mongo_URL)
  .then(() => {
    console.log("connected to db");
  })
  .catch((e) => {
    console.log(e);
  });

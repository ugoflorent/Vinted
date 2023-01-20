const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const { title, nextTick } = require("process");

const app = express();
app.use(express.json());
app.use(cors());

const cloudinary = require("cloudinary").v2;

mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGODB_URI);

cloudinary.config({
  cloud_name: process.env.CLOULDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

const userRoutes = require("./routes/user");
app.use(userRoutes);

const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

app.get("/", (req, res) => {
  res.json("Bienvenue dans mon serveur");
});

app.all("*", (req, res) => {
  res.status(404).json({
    message: "This route doesn't exist",
  });
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});

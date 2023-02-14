const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const { title, nextTick } = require("process");
const stripe = require("stripe")(process.env.STRIPE_API_SECRET);

const app = express();
app.use(express.json());
app.use(cors());

const cloudinary = require("cloudinary").v2;

mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGODB_URI);

cloudinary.config({
  cloud_name: process.env.CLOULDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const userRoutes = require("./routes/user");
app.use(userRoutes);

const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

app.post("/pay", async (req, res) => {
  const stripeToken = req.body.stripeToken;

  const response = await stripe.charges.create({
    amount: 2000,
    currency: "eur",
    description: "La description de l'objet acheté",

    source: stripeToken,
  });
  console.log(response.status);

  // TODO
  // Sauvegarder la transaction dans une BDD MongoDB

  res.json(response);
});

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

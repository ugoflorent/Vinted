const express = require("express");
const router = express.Router();

const Offer = require("../MODELS/Offer");

const fileUpload = require("express-fileupload");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dnkoyraaa",
  api_key: "258442755133324",
  api_secret: "147FcuDE6bT5U3cpxuTR27-GGgg",
  secure: true,
});

const isAuthentificated = require("../middlewares/isAuthenticated");

const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

router.post(
  "/offer/publish",
  isAuthentificated,
  fileUpload(),

  async (req, res) => {
    try {
      console.log(req.body);
      console.log(req.files);
      console.log(req.user);
      const result = await cloudinary.uploader.upload(
        convertToBase64(req.files.picture),
        {
          folder: "/image-Vinted",
        }
      );
      console.log(result);

      const { title, description, price, brand, size, condition, color, city } =
        req.body;

      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          { marque: brand },
          { taille: size },
          { etat: condition },
          { couleur: color },
          { emplacement: city },
        ],
        owner: req.user,
        product_image: result,
      });
      await newOffer.save();
      res.json(newOffer);
    } catch (error) {
      res.status(400).json({ message: error });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    const { title, priceMin, priceMax, sort, page } = req.query;
    const filters = {};
    if (title) {
      filters.product_name = new RegExp(title, "i");
    }
    if (priceMin) {
      filters.product_price = { $gte: Number(priceMin) };
    }
    if (priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = Number(priceMax);
      } else {
        filters.product_price = { $lte: Number(priceMax) };
      }
    }
    const sortFilter = {};
    if (sort === "price-asc") {
      sortFilter.product_price = "asc";
    } else if (sort === "price-desc") {
      sortFilter.product_price = "desc";
    }

    const limit = 5;

    let pageRequired = 1;
    if (page) pageRequired = Number(page);

    const skip = (pageRequired - 1) * limit;

    const offers = await Offer.find(filters)
      .sort(sortFilter)
      .skip(skip)
      .limit(limit)
      .populate("owner", "acount");

    const count = await Offer.countDocuments(filters);

    const reponse = {
      count: count,
      offers: offers,
    };
    res.json(reponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    console.log(req.params);
    const offer = await Offer.findById(req.params.id).populate(
      "owner",
      "acount"
    );
    res.json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

const express = require("express");
const { SHA256 } = require("crypto-js");
const uid2 = require("uid2");
const encBase64 = require("crypto-js/enc-base64");
const router = express.Router();

const User = require("../MODELS/User");

router.post("/user/signup", async (req, res) => {
  try {
    const { username, email, password, newsletter } = req.body;

    if (!username || !email || !password || typeof newsletter !== "boolean") {
      return res.status(400).json({ message: "Missing parameter" });
    }

    const emailAlreadyUsed = await User.findOne({ email });
    console.log(emailAlreadyUsed);
    if (emailAlreadyUsed) {
      return res.status(409).json({ message: "This mail already used" });
    }

    const token = uid2(64);
    const salt = uid2(16);
    const hash = SHA256(salt + password).toString(encBase64);

    const newUser = new User({
      email,
      account: {
        username,
      },
      newsletter,
      token,
      hash,
      salt,
    });
    await newUser.save();
    const reponse = {
      _id: newUser._id,
      account: newUser.account,
      token: newUser.token,
    };
    res.json(reponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).json({ message: "unauthorized" });
    }
    console.log(user);
    const newHash = SHA256(user.salt + password).toString(encBase64);
    console.log(newHash);
    if (newHash !== user.hash) {
      return res.status(400).json({ message: "unauthorized" });
    }
    res.json({
      _id: user._id,
      account: user.account,
      token: user.token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

const User = require("../MODELS/User");

const isAuthentificated = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token = req.headers.authorization.replace("Bearer ", "");

    const user = await User.findOne({ token: token }).select("account");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = isAuthentificated;

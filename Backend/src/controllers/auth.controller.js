const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");

// Create JWT
function generateToken(user) {
  return jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check existing user
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Default role = customer
    const customerRole = await Role.findOne({ name: "customer" });
    if (!customerRole) {
      return res.status(500).json({ message: "Customer role not found" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: customerRole._id
    });

    const token = generateToken(user);

    res.status(201).json({ token });

  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("role");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.json({ token });

  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

// GET CURRENT USER
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: "role",
        populate: { path: "permissions" }
      })
      .select("-passwordHash");

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
};
const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const auth = require("../middleware/auth.middleware");

// Register
router.post("/register", authController.register);

// Login
router.post("/login", authController.login);

// Get current logged user
router.get("/me", auth, authController.me);

module.exports = router;
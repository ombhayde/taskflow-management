const express = require("express")
const authController = require("../controllers/authController")
const { validateRegistration, validateLogin } = require("../middleware/validation")
const { auth } = require("../middleware/auth")  

const router = express.Router()

router.post("/register", validateRegistration, authController.register)
router.post("/login", validateLogin, authController.login)
router.get("/profile", auth, authController.getProfile)

module.exports = router

const express = require("express")
const { register, login, getProfile } = require("../controllers/authController")
const { validateRequest, registerSchema, loginSchema } = require("../middleware/validation")
const auth = require("../middleware/auth")

const router = express.Router()

router.post("/register", validateRequest(registerSchema), register)

router.post("/login", validateRequest(loginSchema), login)

router.get("/profile", auth, getProfile)

module.exports = router

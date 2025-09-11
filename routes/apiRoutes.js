const express = require("express")
const { getApiDocs, getApiHealth } = require("../controllers/apiController")

const router = express.Router()

router.get("/docs", getApiDocs)

router.get("/health", getApiHealth)

module.exports = router

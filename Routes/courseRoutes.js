const express = require("express");
const router = express.Router();
const {courseModel} = require("../db");


router.get("/preview", (req, res) => res.json({ message: "All courses retrieved successfully" }));
router.post("/purchase", (req, res) => res.json({ message: "These courses are available to purchase" }));

module.exports = router;

const express = require("express");
const router = express.Router();
const {courseModel} = require("../db");
const userMiddleware = require("../Middlewares/user");


router.post("/purchase", userMiddleware, async function(req, res) {
  const userId = req.userId;
  const courseId = req.body.courseId;

  await courseModel.create({ 
    userId,
    courseId
  })
  res.json({
     message: "You have successfully purchased the course"
    })
  });

router.get("/preview", async function(req, res){
  const courses = await courseModel.find();
  res.json({
    courses
  })
});

module.exports = router;
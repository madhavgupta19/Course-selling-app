const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const zod = require("zod");
const bcrypt = require("bcrypt");
const  { JWT_USER_PASSWORD } = require("../config");
const { userModel, purchaseModel, courseModel } = require("../db");
const userMiddleware = require("../Middlewares/user");

// Zod Schema for Validation
const signupSchema = zod.object({
  email: zod.string().email(),
  password: zod.string().min(6),
  firstName: zod.string().min(1),
  lastName: zod.string().min(1),
});


// signup end point with zod validation, hashed password
router.post("/signup", async function (req, res) {
  try {
    const { email, password, firstName, lastName } = signupSchema.parse(
      req.body
    );

    // Check for duplicate email
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await userModel.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });
    res.json({ message: "User signed up" });
  } catch (err) {
    if (err instanceof zod.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//signin end point with COOKIE based authentication

router.post("/signin", async function (req, res) {
  const { email, password } = req.body;

  try {
      const user = await userModel.findOne({ email: email });

      if (!user || !(await bcrypt.compare(password, user.password))) {
          return res.status(403).json({ message: "Incorrect Credentials" });
      }

      const token = jwt.sign({ id: user._id }, JWT_USER_PASSWORD, { expiresIn: '1h' });

      res.cookie("token", token, {
          httpOnly: true, // Prevents client-side JavaScript access
          secure: true,   // Use only over HTTPS
          maxAge: 3600000 // 1 hour expiry
      });

      res.json({ message: "User logged in successfully" });
  } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/purchased-courses", userMiddleware, async function (req, res) {
  const userId = req.userId;
  const purchases = await purchaseModel.find({
    userId,
});

let purchasedCourseIds = [];

for (let i = 0; i<purchases.length;i++){ 
    purchasedCourseIds.push(purchases[i].courseId)
}

const coursesData = await courseModel.find({
    _id: { $in: purchasedCourseIds }
})

res.json({
    purchases,
    coursesData
})
});

module.exports = router;
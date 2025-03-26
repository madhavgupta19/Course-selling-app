const { Router } = require("express");
const router = Router();
const {adminModel} = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const JWT_ADMIN_PASSWORD = "madhavadmin";

const zod = require("zod");

// Zod Schema for Validation
const signupSchema = zod.object({
  email: zod.string().email(),
  password: zod.string().min(6),
  firstName: zod.string().min(1),
  lastName: zod.string().min(1),
});


router.post("/signup", async function (req, res) {
  try {
    const { email, password, firstName, lastName } = signupSchema.parse(req.body);

    // Check for duplicate email
    const existingAdmin = await adminModel.findOne({ email});
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await adminModel.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    res.json({ message: "Admin signed up successfully" });
  } catch (err) {
    if (err instanceof zod.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/signin", async function (req, res) {
  const { email, password } = req.body;

  try {
      const admin = await adminModel.findOne({ email: email });

      if (!admin || !(await bcrypt.compare(password, admin.password))) {
          return res.status(403).json({ message: "Incorrect Credentials" });
      }

      const token = jwt.sign({ id: admin._id }, JWT_ADMIN_PASSWORD, { expiresIn: '1h' });

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
// router.post("/", (req, res) => res.json({ message: "Admin courses in successfully" }));
// router.put("/" ,(req, res) => res.json({ message: "Change by admin logged in successfully" }));
// router.get("/bulk", (req, res) => res.json({ message: "COurses logged in successfully" }));

module.exports = router

// ctrl + shift + L to select all occurence at once
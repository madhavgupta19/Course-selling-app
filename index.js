const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./Routes/userRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const courseRoutes = require("./Routes/courseRoutes");
const cookieParser = require("cookie-parser");

require('dotenv').config();

const app = express();
app.use(cookieParser());

app.use(express.json());
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/course", courseRoutes);

// Start the Server
async function main() {
  await mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("DB Connected"))
    .catch(err => console.error(err));

  app.listen(3000, () => console.log("Listening on port 3000"));
}

main();

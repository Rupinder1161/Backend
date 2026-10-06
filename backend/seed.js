const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const seedAdmin = async () => {
  const mongoUri = process.env.MONGO_URI;
  const name = (process.env.ADMIN_NAME || process.env.TEMP_ADMIN_NAME || "Admin").trim();
  const email = (process.env.ADMIN_EMAIL || process.env.TEMP_ADMIN_EMAIL || "")
    .trim()
    .toLowerCase();
  const password = process.env.ADMIN_PASSWORD || process.env.TEMP_ADMIN_PASSWORD;

  if (!mongoUri || !email || !password) {
    throw new Error(
      "Set MONGO_URI, ADMIN_EMAIL, and ADMIN_PASSWORD in backend/.env"
    );
  }

  if (!name) {
    throw new Error("ADMIN_NAME must not be empty");
  }

  await mongoose.connect(mongoUri);

  const existingUser = await User.findOne({ email });
  const hashedPassword = await bcrypt.hash(password, 10);

  if (existingUser) {
    if (existingUser.role !== "admin") {
      throw new Error(
        `The account ${email} exists but is not an admin; no changes were made`
      );
    }

    existingUser.password = hashedPassword;
    existingUser.name = name;
    await existingUser.save();
    console.log(`Admin password reset for ${email}`);
    return;
  }

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "admin",
  });
  console.log(`Admin account created for ${user.email}`);
};

seedAdmin()
  .catch((error) => {
    console.error(`Could not seed admin: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch (error) {
      console.error(`Could not disconnect from MongoDB: ${error.message}`);
      process.exitCode = 1;
    }
  });

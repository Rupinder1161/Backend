const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const createTempAdmin = async () => {
  const { MONGO_URI, TEMP_ADMIN_NAME, TEMP_ADMIN_EMAIL, TEMP_ADMIN_PASSWORD } =
    process.env;

  if (!MONGO_URI || !TEMP_ADMIN_NAME || !TEMP_ADMIN_EMAIL || !TEMP_ADMIN_PASSWORD) {
    throw new Error(
      "Set MONGO_URI, TEMP_ADMIN_NAME, TEMP_ADMIN_EMAIL, and TEMP_ADMIN_PASSWORD in backend/.env"
    );
  }

  if (TEMP_ADMIN_PASSWORD.length < 12) {
    throw new Error("TEMP_ADMIN_PASSWORD must be at least 12 characters long");
  }

  const email = TEMP_ADMIN_EMAIL.trim().toLowerCase();
  if (!email) {
    throw new Error("TEMP_ADMIN_EMAIL must not be empty");
  }

  const name = TEMP_ADMIN_NAME.trim();
  if (!name) {
    throw new Error("TEMP_ADMIN_NAME must not be empty");
  }

  await mongoose.connect(MONGO_URI);

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error(`A user with email ${email} already exists; no changes were made`);
  }

  const password = await bcrypt.hash(TEMP_ADMIN_PASSWORD, 10);
  const user = await User.create({
    name,
    email,
    password,
    role: "admin",
  });

  console.log(`Temporary admin created: ${user.email} (${user._id})`);
};

createTempAdmin()
  .catch((error) => {
    console.error(`Could not create temporary admin: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

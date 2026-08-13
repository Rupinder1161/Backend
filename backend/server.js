const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const appointmentRoutes = require("./routes/appointmentRoutes");
const customerRoutes = require("./routes/customerRoutes");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();

app.use(cors({
  origin: "*"
}));
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/appointments", appointmentRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
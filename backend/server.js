const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", require("./routes/mainRoutes"));

app.get("/", (req, res) => {
  res.send("API Running...");
});

app.listen(process.env.PORT || 5000, () =>
  console.log("Server running")
);
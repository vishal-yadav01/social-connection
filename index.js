const express = require("express");
const cors = require("cors");
const app = express();
const cookiePareser = require("cookie-parser");
const { authRoute } = require("./routes/auth.route");
const { profileRoute } = require("./routes/profile.route");
const { requestRoute } = require("./routes/request.route");
const { userRoute } = require("./routes/user.route");
const dbConnection = require("./configs/dbConncetion");
const fileUploader = require("express-fileupload");
require("dotenv").config();
dbConnection();
const cloudConncetion = require("./configs/cloud");
const { default: helmet } = require("helmet");
cloudConncetion();

app.use(helmet());
app.use(express.json());
app.use(cookiePareser());
app.use(fileUploader({ useTempFiles: true, tempFileDir: "/tmp/" }));
app.use(
  cors({
    origin: "http://localhost:3000", // React frontend ka URL
    credentials: true, // Cookies allow karne ke liye
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"], // Frontend ko ye headers dekhne ki permission
  })
);
app.use("/api/v1/profile", profileRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/request", requestRoute);
app.get("/", (req, res) => {
  res.send("server run");
});
app.listen(4000, () => {
  console.log("🚀 Server running on http://localhost:4000");
});

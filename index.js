const express = require("express");

const app = express();

app.use("/", (req, res) => {
  res.send("hii");
});

app.use("/jk", (req, res) => {
  console.log("run");
  res.send("JK route executed!"); // ✅ Sending a response
});

app.listen(4000, () => {
  console.log("🚀 Server running on http://localhost:4000");
});

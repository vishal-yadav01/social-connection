const mongoose = require("mongoose");

const max_retries = 5;
let retryCount = 0;
const retry_delay = 5000;

const dbConnect = async () => {
  try {
    if (!process.env.DB_URL) throw new Error("Database URL not found");

    await mongoose.connect(process.env.DB_URL);
    console.log("🟢 MongoDB Connection Established.");
    retryCount = 0;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (retryCount < max_retries) {
      retryCount++;
      console.warn(
        `🔄 Retrying MongoDB Connection (${retryCount}/${max_retries}) in ${
          retry_delay / 1000
        }s...`
      );
      setTimeout(dbConnect, retry_delay);
    } else {
      console.error("❌ Max Retry Limit Reached. Database connection failed.");
      process.exit(1);
    }
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB Disconnected! Attempting Reconnect...");
  setTimeout(dbConnect, retry_delay);
});

mongoose.connection.on("error", (err) => {
  console.error(`❌ MongoDB Error: ${err}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down gracefully...");
  await mongoose.connection.close();
  console.log("✅ MongoDB Connection Closed.");
  process.exit(0);
});

module.exports = dbConnect;

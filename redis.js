const {createClient} = require("redis")

const redisClient = createClient({
    url: "redis://localhost:6379" // Change if Redis is running on another machine
})
redisClient.on("error", (err) => console.error("❌ Redis Connection Error:", err));

redisClient.connect()
  .then(() => console.log("✅ Connected to Redis"))
  .catch(err => console.error("❌ Redis Connection Failed:", err));

module.exports = redisClient
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors"); 
const promClient = require("prom-client");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

const eventSchema = new mongoose.Schema({
  eventId: String,
  eventType: String,
  timestamp: String,
  payload: Object,
});

const Event = mongoose.model("Event", eventSchema);

const requestCounter = new promClient.Counter({
  name: "http_requests_total",
  help: "Total number of requests received",
});

app.get("/events", async (req, res) => {
  requestCounter.inc();
  const { eventType, startDate, endDate } = req.query;
  let filter = {};
  if (eventType) filter.eventType = eventType;
  if (startDate && endDate) filter.timestamp = { $gte: startDate, $lte: endDate };
  try {
    const events = await Event.find(filter);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
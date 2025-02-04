const { Kafka } = require("kafkajs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const express = require("express");
const promClient = require("prom-client");

dotenv.config();

const kafka = new Kafka({
  clientId: "consumer-app",
  brokers: [process.env.KAFKA_BROKER], 
  ssl: false, 
});
const consumer = kafka.consumer({ groupId: "event-group" });

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

const messagesConsumed = new promClient.Counter({
  name: "consumer_messages_total",
  help: "Total messages consumed",
});

const app = express();
const PORT = process.env.PORT || 3000;  
app.get("/consumer/metrics", async (req, res) => {  
  res.set("Content-Type", promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
app.listen(PORT, () => console.log(`Consumer running on port ${PORT}`));


const consumeMessages = async () => {
  try {
    await consumer.connect();
    console.log("Connected to Kafka");
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC, fromBeginning: true });
    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const eventData = JSON.parse(message.value.toString());
          const event = new Event(eventData);
          await event.save();
          messagesConsumed.inc();
          console.log("Event saved:", eventData);
        } catch (err) {
          console.error("Error saving event:", err);
        }
      },
    });
  } catch (err) {
    console.error("Error in Kafka consumer:", err);
  }
};
consumeMessages().catch(console.error);

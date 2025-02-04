const { Kafka } = require("kafkajs");
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");
const express = require("express");
const promClient = require("prom-client");

dotenv.config();

const kafka = new Kafka({
  clientId: "producer-app",
  brokers: [process.env.KAFKA_BROKER], 
  ssl: false, 
});
const producer = kafka.producer();

const messagesProduced = new promClient.Counter({
  name: "producer_messages_total",
  help: "Total number of messages produced",
});

const app = express();
const PORT = process.env.PORT || 3000; 
app.get("/producer/metrics", async (req, res) => {  
  res.set("Content-Type", promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
app.listen(PORT, () => console.log(`Producer running on port ${PORT}`));


const sendMessage = async () => {
  try {
    await producer.connect();
    console.log("Connected to Kafka");
    setInterval(async () => {
      try {
        const event = {
          eventId: uuidv4(),
          eventType: "user_signup",
          timestamp: new Date().toISOString(),
          payload: { userId: Math.floor(Math.random() * 1000) },
        };
        await producer.send({
          topic: process.env.KAFKA_TOPIC,
          messages: [{ value: JSON.stringify(event) }],
        });
        messagesProduced.inc();
        console.log("Event produced:", event);
      } catch (err) {
        console.error("Error producing event:", err);
      }
    }, 3000);
  } catch (err) {
    console.error("Error in Kafka producer:", err);
  }
};
sendMessage().catch(console.error);

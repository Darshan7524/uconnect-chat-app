import { Kafka, Producer } from "kafkajs";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import prismaClient from "./prisma";
dotenv.config();
const Kafkapassword: string = process.env.KAFKAPASS || "";
const kafka = new Kafka({
  brokers: ["kafka-2c12a74a-darshanvsimson75-fd05.a.aivencloud.com:23996"],
  ssl: {
    ca: [fs.readFileSync(path.resolve("./ca.pem"), "utf-8")],
  },
  sasl: {
    username: "avnadmin",
    password: Kafkapassword,
    mechanism: "plain",
  },
});
let producer: Producer | null = null;

export async function createProducer() {
  if (producer) return producer;

  const _producer = kafka.producer();
  await _producer.connect();
  producer = _producer;
  return producer;
}

export async function produceMessage(message: string) {
  const producer = await createProducer();
  await producer.send({
    messages: [{ key: `message-${Date.now()}`, value: message }],
    topic: "MESSAGES",
  });
  return true;
}

export async function startMessageConsumer() {
  console.log("Running the consumer.... ");
  const consumer = kafka.consumer({ groupId: "default" });
  await consumer.connect();
  await consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });
  await consumer.run({
    autoCommit: true,
    eachMessage: async ({ message, pause }) => {
      if (!message.value) return;
      console.log("New message just arrived...");
      try {
        await prismaClient.message.create({
          data: {
            text: message.value?.toString(),
          },
        });
      } catch (err) {
        console.log("Encountered an error while consuming message...", err);
        pause();
        setTimeout(() => {
          consumer.resume([{ topic: "MESSAGES" }]);
        }, 60 * 1000);
      }
    },
  });
}

export default kafka;

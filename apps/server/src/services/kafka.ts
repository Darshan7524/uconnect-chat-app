import { Kafka, Producer } from "kafkajs";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
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
    mechanism: "plain", // currently at 31 min
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

export default kafka;

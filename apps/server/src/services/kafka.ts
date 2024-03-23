import { Kafka, Producer } from "kafkajs";
import fs from "fs";
import path from "path";
const kafka = new Kafka({
  brokers: ["kafka-2c12a74a-darshanvsimson75-fd05.a.aivencloud.com:23996"],
  ssl: {
    ca: [fs.readFileSync(path.resolve("./ca.pem"), "utf-8")],
  },
  sasl: {
    username: "avnadmin",
    password: "AVNS_kR99yrTN4AReY-3u2f0",
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

export default kafka;

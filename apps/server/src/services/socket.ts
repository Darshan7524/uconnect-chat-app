import { Server } from "socket.io";
import Redis from "ioredis";
import { produceMessage } from "./kafka";
import dotenv from "dotenv";
dotenv.config();
// here I have connected TO REDIS in a different way. check 40:00 in t1
// const RedisUri = env("DATABASE_URL");
const RedisUri: string = process.env.REDIS_URI || "";
const pub = new Redis(RedisUri);
const sub = new Redis(RedisUri);

class SocketService {
  private _io: Server;
  constructor() {
    console.log("Init Socket Service....");

    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });
    sub.subscribe("MESSAGES");
  }

  public initListeners() {
    const io = this._io;
    console.log("Init SOcket Listeners");

    io.on("connect", (socket) => {
      console.log(`New socket Connected`, socket.id);
      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log("New measage Recieved", message);
        // i need to publish this message to redis
        await pub.publish("MESSAGES", JSON.stringify({ message }));
      });
    });

    sub.on("message", async (channel, message) => {
      if (channel === "MESSAGES") {
        io.emit("message", message);
        await produceMessage(message);
        console.log("Message produced to kafka broker service");
      }
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;

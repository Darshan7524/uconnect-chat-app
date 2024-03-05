import { Server } from "socket.io";
import Redis from "ioredis";
// here I have connected TO REDIS in a different way. check 40:00 in t1
const RedisUri =
  "rediss://default:AVNS_ge5RLFHFxeZgQopyIlt@redis-3f2ea483-darshanvsimson75-fd05.a.aivencloud.com:23984";
const pub = new Redis(RedisUri);
const sub = new Redis(RedisUri);

class SocketService {
  private _io: Server;
  constructor() {
    console.log("INit Socket Service....");

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

    sub.on("message", (channel, message) => {
      if (channel === "MESSAGES") {
        io.emit("message", message);
      }
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;

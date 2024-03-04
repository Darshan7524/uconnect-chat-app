import { Server } from "socket.io";
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
  }

  public initListeners() {
    const io = this._io;
    console.log("Init SOcket Listeners");

    io.on("connect", (socket) => {
      console.log(`New socket Connected`, socket.id);
      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log("New measage Recieved", message);
      });
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;

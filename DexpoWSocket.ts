import WebSocket from "ws";
import { randomUUID } from "crypto";

const ws = new WebSocket("wss://api.0x.org/orderbook/v1");
const id = randomUUID();

export async function SendMessage() {
  ws.on("open", () => {
    const subscribeMsg = {
      type: "subscribe",
      channel: "orders",
      requestId: id,
      // ...
    };

    ws.send(JSON.stringify(subscribeMsg));
  });
}

export async function ReceiveMessage(callback) {
  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data.toString());
    callback(data);
  };
}

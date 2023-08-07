import WebSocket from "ws";
import { randomUUID } from "crypto";
import { SendMessage, ReceiveMessage } from "./DexpoWSocket";

const port = 3000;
const ws = new WebSocket.Server({ port });
const requesters: { [key: string]: WebSocket } = {};

function ConnectedClients() {
  ws.on("connection", (ws: WebSocket) => {
    console.log("received connection");
    const id = randomUUID();
    requesters[id] = ws;

    ws.onclose = (closeEvent) => {
      console.log("closing", id);
      delete requesters[id];
    };
  });
}

function SendOrdersToClients(orders) {
  const orderData = JSON.stringify(orders);
  Object.values(requesters).forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(orderData);
    }
  });
}

// Call ReceiveMessage and pass a callback function to handle the received data
ReceiveMessage((data) => {
  const order = data.payload[0].order;
  const metadata = data.payload[0].metaData;
  const makerAmount = order.makerAmount;
  const takerAmount = order.takerAmount;
  const decimals = 10 ** 18;

  const priceInTakerAmount = takerAmount / decimals;
  const priceInMakerAmount = makerAmount / decimals;

  const priceInTakerToken = priceInMakerAmount / priceInTakerAmount;

  const quantity = metadata.remainingFillableTakerAmount;
  const quantityInMakerToken = quantity / decimals;

  const totalInTakerToken = quantityInMakerToken * priceInTakerToken;
  const state = metadata.state;

  const initialAmount = order.takerAmount;
  const initialTakerAmount = initialAmount / decimals;
  // console.log("Initial Taker Amount: ", initialTakerAmount);
  // console.log("PriceInTakerToken : ", priceInTakerToken);
  // console.log("Quantity : ", quantityInMakerToken);
  // console.log("Total:", totalInTakerToken);
  // console.log("State: ", state);
  
  SendOrdersToClients({
    initialTakerAmount,
    priceInTakerToken,
    quantityInMakerToken,
    totalInTakerToken,
    state,
  });
});

SendMessage();
ConnectedClients()

// export { ConnectedClients, SendOrdersToClients };

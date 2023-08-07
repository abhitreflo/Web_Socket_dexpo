import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:3000");

ws.on("open", () => {
  console.log("Client 1 connected to the server.");
});

ws.onmessage = (msg) =>{
   
    console.log(msg.data)
};

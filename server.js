const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

let userCount = 0;

wss.on("connection", (ws) => {
  userCount++;
  const userId = `User${userCount}`;
  ws.userId = userId;

  console.log(`${userId} connected`);

  ws.send(
    JSON.stringify({
      type: "system",
      content: `Welcome to the chat, ${userId}!`,
      userId: "System",
    })
  );

  wss.clients.forEach((client) => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "system",
          content: `${userId} joined the chat`,
          userId: "System",
        })
      );
    }
  });

  ws.on("message", (message) => {
    try {
      const parsed = JSON.parse(message);
      console.log(`Message from ${ws.userId}: ${parsed.content}`);

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "message",
              content: parsed.content,
              userId: ws.userId,
              timestamp: new Date().toLocaleTimeString(),
            })
          );
        }
      });
    } catch (e) {
      console.error("Error parsing message:", e);
    }
  });

  ws.on("close", () => {
    console.log(`${ws.userId} disconnected`);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            type: "system",
            content: `${ws.userId} left the chat`,
            userId: "System",
          })
        );
      }
    });
  });
});

console.log("WebSocket server running on ws://localhost:8080");

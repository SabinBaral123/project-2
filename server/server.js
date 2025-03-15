import express from "express";
import http from "http";
import { Server } from "socket.io";

// Reads PORT from the OS, the --env-file flag, or defaults to 9000
const PORT = process.env.PORT || 9000;

// The express server (configured, then passed to httpServer)
const app = express();

// Allows static hosting content of the public/ folder
// https://expressjs.com/en/api.html#express.static
app.use(express.static("public"));

// Parses incoming requests with JSON payloads
// https://expressjs.com/en/api.html#express.json
app.use(express.json());

// Custom application-level middleware for logging all requests
app.use((req, _res, next) => {
  const timestamp = new Date(Date.now());
  console.log(
    `[${timestamp.toDateString()} ${timestamp.toTimeString()}] / ${timestamp.toISOString()}`
  );
  console.log(req.method, req.hostname, req.path);
  console.log("headers:", req.headers);
  console.log("body:", req.body);
  next();
});

// Creating an httpServer using the express configuration
// https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener
const httpServer = http.createServer(app);

// new socket server
const io = new Server(httpServer, {});

// socket event handling
io.on("connect", socket => {
    console.log("New connection", socket.id);

    // Client will have to emit "join" with joinInfo
    socket.on("join", joinInfo => {
        console.log(joinInfo);
        // The client has to be sending joinInfo in this format
        const { roomName, userName } = joinInfo;

        // Using socket.data to keep track of the new client identifier: userName
        socket.data.userName = userName; // keep track of unique user identifier

        // Add the socket to the roomName room
        socket.join(roomName);

        // socket.id is a "connection id" and works as a "single socket room" for direct messages
      	// socket.emit("joined", roomName); // equivalent call
        io.to(socket.id).emit("joined", { roomName, userName });

        // Add your own event emit here
      	// So that clients on the room can be notified that a new user as joined
        socket.to(roomName).emit("user-joined", `${userName} has joined the ${roomName}`);
    });


  // Hook-up the "broadcast to lab-14" listener
  socket.on("broadcast to lab-14", (dataSentWithClientEmit) => {
    io
      .to("lab-14")
      .emit(
        "a lab-14 broadcast",
        `${socket.id} sent ${dataSentWithClientEmit}`
      );
    // io.to("lab-14") would emit to everyone in the room, including the socket that sent the message
    // socket.to(room) emits to everyone in the room, but excludes the socket who sent the message
  });
  socket.emit(
    "a hello from the server",
    `hello ${socket.id}!`
  );
  // Add new socket to the room
  socket.join("lab-14");

  // Count how many sockets are currently in the room, then broadcast that total
  // fetchSockets is async. Using then to resolve it
  io.in("lab-14")
    .fetchSockets()
    .then((socketsInRoom) => {
      io.to("lab-14").emit(
        "room update",
        `There are ${socketsInRoom.length} sockets in lab-14`
      );
    });
});
// Start the server listening on PORT, then call the callback (second argument)
httpServer.listen(PORT, () => console.log(`Listening on port ${PORT}`));
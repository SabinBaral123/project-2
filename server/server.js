import express from "express";
import http from "http";
import { Server } from "socket.io";
import * as data from "./data.js";
import * as colors from "./colour.js";

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

//Rooms object to track the users 
const usersInRoom ={};
io.on("connect", (socket) => {
  console.log("New connection", socket.id);

  socket.on("join", (joinInfo) => {
    const { roomName, userName } = joinInfo;

    if (data.isUserNameTaken(userName)) {
      joinInfo.error = `The name ${userName} is already taken`;
    } else {
      data.registerUser(userName);
      // Adding the generated color to the joinInfo object
      joinInfo.color = colors.getRandomColor();
      socket.data = joinInfo;
      socket.join(roomName);

      // adding user to rooms user list 
      if(!usersInRoom[roomName])
      {
        usersInRoom[roomName] =[];
      }
      usersInRoom[roomName].push({userName,color:joinInfo.color});

      //emitting the user-list to the room 
      io.to(roomName).emit("update-users",usersInRoom[roomName]);

      socket.on("disconnect", () => {
        data.unregisterUser(userName);
        colors.releaseColor(socket.data.color);

        //Removing the user you disconnected and assigning new/same list of user  
        usersInRoom[roomName] = usersInRoom[roomName].filter(u=> u.userName !== userName);

        // updating the user list after removing user if disconnected 

        io.to(roomName).emit("update-users", usersInRoom[roomName]);
        // Notify the room that the user has left
        data.addMessage(roomName, {
          sender: "",
          text: `${userName} has left room ${roomName}`,
          timestamp: Date.now(),
        });
        io.to(roomName).emit("chat update", data.roomLog(roomName));
      });

      // Notify the room that the user has joined

      data.addMessage(roomName, {
        sender: "",
        text: `${userName} has joined room ${roomName}`,
        timestamp: Date.now(),
      });
      io.to(roomName).emit("chat update", data.roomLog(roomName));

      socket.on("message", (text) => {
        const { roomName, userName, color } = socket.data;
        const messageInfo = {
          sender: userName,
          text,
          timestamp: Date.now,
          color,
        };
        console.log(roomName, messageInfo);
        data.addMessage(roomName, messageInfo);
        io.to(roomName).emit("chat update", data.roomLog(roomName));
      });
    }

    console.log(joinInfo);
    socket.emit("join-response", joinInfo);
  });
});
// Start the server listening on PORT, then call the callback (second argument)
httpServer.listen(PORT, () => console.log(`Listening on port ${PORT}`));

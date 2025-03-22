import { useState, useEffect, useRef } from "react"; // Add the useEffect and useRef imports
import Chat from "./components/Chat";
import Socket from "./components/Socket";
import Header from "./components/Header";
import Login from "./components/Login";
import "./App.css";
import io from "socket.io-client";

import { createTheme, ThemeProvider } from "@mui/material";
import { red } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    primary: {
      main: red[800],
    },
  },
});
function App() {
  /* Login Info */

  const [joinInfo, setJoinInfo] = useState({
    userName: '',
    roomName: '',
    error: ''
});
 
const hasJoined = () => joinInfo.userName && joinInfo.roomName && !joinInfo.error;
const joinRoom = joinData => socket.current.emit("join", joinData);

const [chatLog, setChatLog] = useState([]);
    const sendMessage = (text) => {
        socket.current.send(text);
    }
/* WebSocket */

// https://react.dev/reference/react/useRef
// useRef is a React Hook that lets you reference a value that’s not needed for rendering
const effectRan = useRef(false);
const socket = useRef();

const connectToServer = () => {
    if (effectRan.current) return; // Don't run twice with Strict Mode

    try {
        // Only use localhost:9000 if the app is being hosted on port 5173 (i.e. Vite)
        const wsServerAddress = window.location.port == 5173 ? "localhost:9000" : "/";
        const ws = io.connect(wsServerAddress, { transports: ["websocket"] });

        // Handle join
        ws.on("join-response", setJoinInfo)
        ws.on("chat update", setChatLog);

        socket.current = ws;
        effectRan.current = true; // Flag to prevent connecting twice
    }
    catch (e) {
        console.warn(e);
    }
};

useEffect(() => {
    connectToServer();
}, []);

return (
  <ThemeProvider theme={theme}>
      <Header title="App Name - Sabin Baral" />
      {
          hasJoined() ?
          <Chat {...joinInfo} sendMessage={sendMessage} chatLog={chatLog}/>
          : <Login joinRoom={joinRoom} error={joinInfo.error} />
      }
  </ThemeProvider>
);
  
}

export default App;

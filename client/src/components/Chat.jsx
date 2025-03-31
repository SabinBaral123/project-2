import { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  CardHeader,
  CardContent,
  Divider,
  Typography,
  TextField,
  Button,
  List,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { format, getDay } from "date-fns";

const Chat = (props) => {
  const lastMessageRef = useRef(null);
  const [messageText, setMessageText] = useState("");

  const renderMessage = (message, index) => {
    //NEWdAY Messages
    if (message.newDay) {
      return (
        <div key={index} ref={lastMessageRef} style={{ marginBottom: "1em" }}>
          <Typography variant="h6" textAlign="center">
            <strong>{message.text}</strong>
          </Typography>
        </div>
      );
    }

    //Timestamps
    const messageTimestamp = format(message.timestamp, "HH:mm");

    if (message.sender == "") {
      return (
        <div
          key={index}
          ref={lastMessageRef}
          style={{ marginTop: "1em", marginBottom: "1em" }}
        >
          <Typography variant="h6" textAlign="center">
            <i>{message.text}</i>
          </Typography>
          <Typography variant="body2" textAlign="center">
            <i>{messageTimestamp}</i>
          </Typography>
        </div>
      );
    }
    const yourOwnMessage = message.sender == props.userName;
    const messageClassName = yourOwnMessage ? "user-message" : "message";
    return (
      <div key={index} ref={lastMessageRef} className={messageClassName} >
        <div className="message-bubble" style={{ borderColor: message.color }}>
          <Typography variant="h6" className="message-text" sx={{ color: message.color }}>
            <strong>{message.sender}</strong>
          </Typography>
          <Typography variant="h6" className="message-text">
            {message.text}
          </Typography>
          <Typography variant="h6" sx={{ textAlign: "right" }}>
            <i>{messageTimestamp}</i>
          </Typography>
        </div>
      </div>
    );
  };

  const renderChatLog = () => {
    const chat = props.chatLog ?? [];
    const chatWithNewDayMessages = [];
    let lastMessage = null;

    chat.forEach((message) => {
      if (
        !lastMessage ||
        getDay(lastMessage.timestamp) !== getDay(message.timestamp)
      ) {
        chatWithNewDayMessages.push({
          sender: "",
          text: format(message.timestamp, "PPPP"),
          newDay: true,
        });
      }

      chatWithNewDayMessages.push(message);
      lastMessage = message;
    });

    return chatWithNewDayMessages.map(renderMessage);
  };

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [props.chatLog]);

  const handleSendMessage = () => {
    if (!messageText) return;
    props.sendMessage(messageText);
    setMessageText("");
  };

  return (
    <Paper
      elevation={4}
      sx={{ mt: "0.5em", display: "flex", flexDirection: "column" }}
    >
      <CardHeader title={`${props.roomName} (as ${props.userName})`} />
      <Divider />
      <CardContent>
        <List sx={{ height: "60vh", overflowY: "scroll", textAlign: "left" }}>
          {renderChatLog()}
        </List>
        <Divider />
        <Box sx={{ mt: "1em", display: "flex", direction: "row", flex: 1 }}>
          <TextField
            fullWidth
            sx={{ mr: "1em", flex: 9 }}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ flex: 1 }}
            onClick={handleSendMessage}
          >
            <SendIcon />
          </Button>
        </Box>
      </CardContent>
    </Paper>
  );
};

export default Chat;

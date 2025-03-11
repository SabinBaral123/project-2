import { useState, useEffect,useRef } from "react";
import io from "socket.io-client";

const Socket = () => {

    const [text, setText] = useState("Client not connected");

    // useRef is a React Hook that lets you reference a value that’s not needed for rendering
    const effectRan = useRef(false);

    const connectToServer = () => 
    {
        if (effectRan.current) return; // dont run twice with strict mode 

        try{
            // Later need to be dynamicv for AWS hosting

            const socket = io.connect("localhost:9000",{
                forceNew: true,
                transports: ["websocket"],
            });
            socket.on("connect", () =>
                setText("Client connected")
            );

            socket.on("disconnect", () =>
                setText("Client disconnected")
            );

            effectRan.current = true; // Flag to prevent connecting twice

        }
        catch(e) {
            console.warn(e);
        }
    };

    useEffect(() => {
        connectToServer();
    },[]);

    return (
        <>
        {text}
        </>
    );
};

export default Socket;


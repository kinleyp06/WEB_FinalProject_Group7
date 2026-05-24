import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function useSocket() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const socket = io("http://localhost:3000");
    socket.on("notification", (data) => {
      console.log("New notification:", data);
      setNotifications((prev) => [...prev, data]);
    });
    return () => socket.disconnect();
  }, []);

  return notifications;
}

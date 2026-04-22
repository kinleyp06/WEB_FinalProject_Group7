"use client";
import { useEffect } from "react";
import toast from "react-hot-toast";

interface NotificationToastProps {
  message: string;
  type?: "info" | "success" | "warning" | "error";
  duration?: number;
}

// This component is for displaying notifications
// To use it: toast.success("Meal plan updated!")

export function showNotification(message: string, type: "info" | "success" | "warning" | "error" = "info") {
  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    case "warning":
      toast.custom((t) => (
        <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {message}
        </div>
      ));
      break;
    default:
      toast.custom((t) => (
        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {message}
        </div>
      ));
  }
}

// For WebSocket notifications (will be used in Phase 3)
export function useNotificationListener() {
  useEffect(() => {
    // This will be implemented in Phase 3 with Socket.io
    console.log("Notification listener ready");
  }, []);
}
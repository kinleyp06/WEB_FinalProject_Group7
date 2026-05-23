import admin from "firebase-admin";
import cron from "node-cron";

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

let tokens = [];

// Save token
export const saveToken = (req, res) => {
  const { token } = req.body;
  tokens.push(token);
  res.send("Token saved");
};

// Send notification
const sendNotification = (message) => {
  tokens.forEach(token => {
    admin.messaging().send({
      token,
      notification: {
        title: "Mess Reminder",
        body: message,
      },
    });
  });
};

// ⏰ Schedule
cron.schedule("30 7 * * *", () => {
  sendNotification("Breakfast is ready 🍳");
});

cron.schedule("0 12 * * *", () => {
  sendNotification("Lunch is ready 🍛");
});

cron.schedule("0 16 * * *", () => {
  sendNotification("Evening Tea ☕");
});

cron.schedule("30 19 * * *", () => {
  sendNotification("Dinner is ready 🍽️");
});
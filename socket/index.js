const socketIO = require("socket.io");
const http = require("http");
const express = require("express");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*", // Thay bằng domain frontend của bạn
    methods: ["GET", "POST"]
  }
});

require("dotenv").config({
  path: "./.env",
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world from socket server!");
});

let users = [];

const addUser = (userId, socketId) => {
  // Remove existing user if exists (user might reconnect)
  users = users.filter((user) => user.userId !== userId);
  users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

// Define a message object with a seen property
const createMessage = ({ senderId, receiverId, text, images, conversationId }) => ({
  senderId,
  receiverId,
  text,
  images,
  conversationId,
  seen: false,
  timestamp: new Date()
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
    console.log(`User ${userId} added with socket ${socket.id}`);
  });

  // send and get message
  socket.on("sendMessage", ({ senderId, receiverId, text, images, conversationId }) => {
    const message = createMessage({ senderId, receiverId, text, images, conversationId });

    const receiver = getUser(receiverId);
    const sender = getUser(senderId);

    console.log(`Message from ${senderId} to ${receiverId}`);
    console.log(`Receiver found:`, receiver);

    // Send message to receiver if online
    if (receiver) {
      io.to(receiver.socketId).emit("getMessage", {
        senderId,
        receiverId,
        text,
        images,
        conversationId,
        createdAt: Date.now(),
      });
    }

    // Broadcast to conversation room if using rooms
    if (conversationId) {
      socket.to(conversationId).emit("getMessage", {
        senderId,
        receiverId,
        text,
        images,
        conversationId,
        createdAt: Date.now(),
      });
    }
  });

  // Handle message seen
  socket.on("messageSeen", ({ senderId, receiverId, messageId }) => {
    const sender = getUser(senderId);

    if (sender) {
      io.to(sender.socketId).emit("messageSeen", {
        senderId,
        receiverId,
        messageId,
      });
    }
  });

  // update and get last message
  socket.on("updateLastMessage", ({ lastMessage, lastMessageId, conversationId }) => {
    // Broadcast to all users
    io.emit("getLastMessage", {
      lastMessage,
      lastMessageId,
      conversationId,
    });
  });

  // Join conversation room
  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // Leave conversation room
  socket.on("leaveConversation", (conversationId) => {
    socket.leave(conversationId);
    console.log(`Socket ${socket.id} left conversation ${conversationId}`);
  });

  // Send message to conversation room
  socket.on("sendMessageToRoom", ({ conversationId, message }) => {
    // Send to all users in the conversation room
    socket.to(conversationId).emit("receiveMessage", message);
    // Also send back to sender for confirmation
    socket.emit("messageDelivered", message);
  });

  //when disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

server.listen(process.env.PORT || 4000, () => {
  console.log(`Server is running on port ${process.env.PORT || 4000}`);
});
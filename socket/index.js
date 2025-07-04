const socketIO = require("socket.io");
const http = require("http");
const express = require("express");
const cors = require("cors");
const Order = require("../backend/model/order.model");
const Shipper = require("../backend/model/shipper.model");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"],
  },
});

require("dotenv").config({
  path: "./.env",
});

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world from socket server!");
});

let users = [];

const addUser = (userId, socketId) => {
  users = users.filter((user) => user.userId !== userId);
  users.push({ userId, socketId });
  console.log(`User ${userId} added with socket ${socketId}. Current users:`, users);
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
  console.log(`User with socket ${socketId} removed. Current users:`, users);
};

const getUser = (userId) => {
  const user = users.find((user) => user.userId === userId);
  console.log(`Looking for user ${userId}:`, user);
  return user;
};

const createMessage = ({ senderId, receiverId, text, images, conversationId }) => ({
  senderId,
  receiverId,
  text,
  images,
  conversationId,
  seen: false,
  timestamp: new Date(),
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  socket.on("findShippers", async ({ orderId, orderData, shippers, ward }) => {
    try {
      console.log(`Find shippers for order ${orderId} in ward ${ward}`);
      let fullOrderData = orderData;
      if (!fullOrderData.cart || !fullOrderData.shippingAddress) {
        const order = await Order.findById(orderId);
        if (!order) {
          console.error(`Order ${orderId} not found`);
          return;
        }
        fullOrderData = {
          _id: order._id,
          status: order.status,
          cart: order.cart,
          shippingAddress: order.shippingAddress,
          user: order.user,
          totalPrice: order.totalPrice,
          shopAddress: order.cart[0]?.shopAddress || {},
          createdAt: order.createdAt,
        };
      }
      shippers.forEach((shipper) => {
        const user = getUser(shipper._id);
        if (user) {
          console.log(`Notifying shipper ${shipper._id} for order ${orderId}`);
          io.to(user.socketId).emit("newOrderAvailable", fullOrderData);
        } else {
          console.log(`Shipper ${shipper._id} not connected`);
        }
      });
    } catch (error) {
      console.error(`Error in findShippers for order ${orderId}:`, error.message);
    }
  });

  socket.on("orderAccepted", async ({ orderId, shipperId }) => {
    console.log(`Order ${orderId} accepted by shipper ${shipperId}`);
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        console.error(`Order ${orderId} not found`);
        return;
      }
      const shipper = await Shipper.findById(shipperId);
      if (!shipper) {
        console.error(`Shipper ${shipperId} not found`);
        return;
      }
      const shopId = order.cart[0].shopId;
      const shopUser = getUser(shopId);
      if (shopUser) {
        console.log(`Notifying seller ${shopId} about order ${orderId} with shipper ${shipper._id}`);
        io.to(shopUser.socketId).emit("orderAcceptedByShipper", {
          orderId,
          shipper: {
            _id: shipper._id,
            name: shipper.name,
            phoneNumber: shipper.phoneNumber,
            deliveredArea: shipper.deliveredArea,
          },
        });
      } else {
        console.error(`Seller ${shopId} not connected`);
      }
      users.forEach((user) => {
        if (user.userId !== shipperId) {
          console.log(`Notifying user ${user.userId} that order ${orderId} was accepted`);
          io.to(user.socketId).emit("orderAccepted", { orderId, shipperId });
        }
      });
    } catch (error) {
      console.error(`Error in orderAccepted for order ${orderId}:`, error.message);
    }
  });

  socket.on("sendMessage", ({ senderId, receiverId, text, images, conversationId }) => {
    const message = createMessage({ senderId, receiverId, text, images, conversationId });
    const receiver = getUser(receiverId);
    console.log(`Message from ${senderId} to ${receiverId}`);
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

  socket.on("updateLastMessage", ({ lastMessage, lastMessageId, conversationId }) => {
    io.emit("getLastMessage", {
      lastMessage,
      lastMessageId,
      conversationId,
    });
  });

  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  socket.on("leaveConversation", (conversationId) => {
    socket.leave(conversationId);
    console.log(`Socket ${socket.id} left conversation ${conversationId}`);
  });

  socket.on("sendMessageToRoom", ({ conversationId, message }) => {
    socket.to(conversationId).emit("receiveMessage", message);
    socket.emit("messageDelivered", message);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

server.listen(process.env.PORT || 4000, () => {
  console.log(`Socket server is running on port ${process.env.PORT || 4000}`);
});
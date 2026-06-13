import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
const server = http.createServer(app);

const roomUsers = {};
const roomMessages = {};
const roomTyping = {};

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

const cleanEmptyRoom = (room) => {
  const hasUsers = Array.isArray(roomUsers[room]) && roomUsers[room].length > 0;
  if (!hasUsers) {
    delete roomUsers[room];
    delete roomMessages[room];
    delete roomTyping[room];
  }
};

const broadcastRoomState = (room) => {
  const users = roomUsers[room] ? roomUsers[room].map((user) => user.name) : [];
  io.to(room).emit("user_list", users);
  io.to(room).emit("room_data", {
    room,
    users,
    messages: roomMessages[room] || [],
  });
  io.to(room).emit("presence_update", {
    room,
    count: users.length,
  });
};

const emitSystemMessage = (room, text) => {
  const message = {
    id: `sys-${Date.now()}`,
    type: "system",
    text,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  if (!roomMessages[room]) {
    roomMessages[room] = [];
  }
  roomMessages[room].push(message);
  io.to(room).emit("system_message", message);
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const leaveRoom = () => {
    const room = socket.room;
    const name = socket.username;

    if (!room || !roomUsers[room]) {
      return;
    }

    roomUsers[room] = roomUsers[room].filter((user) => user.id !== socket.id);
    roomTyping[room]?.delete(name);
    socket.leave(room);
    socket.room = null;
    socket.username = null;

    if (name) {
      emitSystemMessage(room, `${name} left the room.`);
    }

    broadcastRoomState(room);
    cleanEmptyRoom(room);
  };

  socket.on("join_room", ({ name, room }) => {
    const sanitizedRoom = typeof room === "string" ? room.trim().toUpperCase() : "";
    const sanitizedName = typeof name === "string" ? name.trim() : "";

    if (!sanitizedRoom || !sanitizedName) {
      socket.emit("join_error", { message: "Username and room code are required." });
      return;
    }

    const currentNames = roomUsers[sanitizedRoom]?.map((user) => user.name) || [];
    if (currentNames.includes(sanitizedName)) {
      socket.emit("join_error", { message: "That username is already taken in this room." });
      return;
    }

    socket.join(sanitizedRoom);
    socket.room = sanitizedRoom;
    socket.username = sanitizedName;

    if (!roomUsers[sanitizedRoom]) {
      roomUsers[sanitizedRoom] = [];
    }
    if (!roomMessages[sanitizedRoom]) {
      roomMessages[sanitizedRoom] = [];
    }
    if (!roomTyping[sanitizedRoom]) {
      roomTyping[sanitizedRoom] = new Set();
    }

    roomUsers[sanitizedRoom].push({ id: socket.id, name: sanitizedName });

    emitSystemMessage(sanitizedRoom, `${sanitizedName} joined the room.`);
    broadcastRoomState(sanitizedRoom);
    
    const currentUsersList = roomUsers[sanitizedRoom] ? roomUsers[sanitizedRoom].map((user) => user.name) : [];
    const currentMessages = roomMessages[sanitizedRoom] || [];

    socket.emit("join_success", { 
      room: sanitizedRoom,
      users: currentUsersList,
      messages: currentMessages
    });

    console.log(`${sanitizedName} joined ${sanitizedRoom}`);
  });

  socket.on("send_message", (data) => {
    const room = socket.room;
    const author = socket.username;
    const content = typeof data.message === "string" ? data.message.trim() : "";

    if (!room || !author || !content) {
      return;
    }

    const message = {
      id: `${socket.id}-${Date.now()}`,
      type: "message",
      author,
      message: content,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    if (!roomMessages[room]) {
      roomMessages[room] = [];
    }
    roomMessages[room].push(message);

    io.to(room).emit("receive_message", message);
  });

  socket.on("typing", () => {
    const room = socket.room;
    const name = socket.username;
    if (!room || !name) return;
    roomTyping[room]?.add(name);
    io.to(room).emit("typing_update", Array.from(roomTyping[room]));
  });

  socket.on("stop_typing", () => {
    const room = socket.room;
    const name = socket.username;
    if (!room || !name) return;
    roomTyping[room]?.delete(name);
    io.to(room).emit("typing_update", Array.from(roomTyping[room]));
  });

  socket.on("leave_room", () => leaveRoom());

  socket.on("disconnect", () => {
    leaveRoom();
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send({ message: "Instant Msg server is running" });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

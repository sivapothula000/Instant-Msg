import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import Join from "./components/Join";
import Chat from "./components/Chat";
import { getSocketUrl } from "./utils/socketUrl";
import "./styles/join.css";
import "./styles/chat.css";
import "./styles/header.css";

function App() {
  const [session, setSession] = useState({ name: "", room: "" });
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("connecting");
  const [joinPending, setJoinPending] = useState(false);
  const [initialData, setInitialData] = useState(null);

  const socket = useMemo(() => {
    const socketUrl = getSocketUrl();
    const client = io(socketUrl, {
      transports: ["websocket"],
      autoConnect: false,
    });

    client.on("connect", () => setStatus("connected"));
    client.on("disconnect", () => setStatus("disconnected"));
    client.on("reconnect_attempt", () => setStatus("reconnecting"));
    client.on("connect_error", () => setStatus("offline"));

    return client;
  }, []);

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    const handleJoinSuccess = (data) => {
      setInitialData(data);
      setJoined(true);
      setJoinPending(false);
    };

    const handleJoinError = ({ message }) => {
      setError(message || "Unable to join room.");
      setJoinPending(false);
    };

    socket.on("join_success", handleJoinSuccess);
    socket.on("join_error", handleJoinError);

    return () => {
      socket.off("join_success", handleJoinSuccess);
      socket.off("join_error", handleJoinError);
    };
  }, [socket]);

  const handleJoin = ({ name, room }) => {
    const normalizedName = name.trim();
    const normalizedRoom = room.trim().toUpperCase();

    if (!normalizedName || !normalizedRoom) {
      setError("Please enter a username and room code.");
      return;
    }

    setError("");
    setJoinPending(true);
    setSession({ name: normalizedName, room: normalizedRoom });
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("join_room", { name: normalizedName, room: normalizedRoom });
  };

  const handleLeave = () => {
    socket.emit("leave_room");
    setJoined(false);
    setSession({ name: "", room: "" });
    setError("");
  };

  return (
    <div className="app-shell">
      {!joined ? (
        <Join
          onJoin={handleJoin}
          joinPending={joinPending}
          errorMessage={error}
          status={status}
          defaultRoom={session.room}
        />
      ) : (
        <Chat
          socket={socket}
          currentUser={session.name}
          roomCode={session.room}
          onLeave={handleLeave}
          initialData={initialData}
        />
      )}
    </div>
  );
}

export default App;

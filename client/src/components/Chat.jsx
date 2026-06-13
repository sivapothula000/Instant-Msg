import { useEffect, useRef, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import NotificationMessage from "./NotificationMessage";

const formatTyping = (typingUsers, currentUser) => {
  const active = typingUsers.filter((user) => user !== currentUser);
  if (active.length === 0) return "";
  if (active.length === 1) return `${active[0]} is typing...`;
  return `${active.join(", ")} are typing...`;
};

function Chat({ socket, currentUser, roomCode, onLeave, initialData }) {
  const [users, setUsers] = useState(initialData?.users || []);
  const [messages, setMessages] = useState(initialData?.messages || []);
  const [typingUsers, setTypingUsers] = useState([]);
  const [status, setStatus] = useState("connected");
  const [unreadCount, setUnreadCount] = useState(0);
  const [ready, setReady] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const messagesEndRef = useRef(null);
  const feedRef = useRef(null);
  const visibleRef = useRef(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      visibleRef.current = document.visibilityState === "visible";
      if (visibleRef.current) {
        setUnreadCount(0);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, typingUsers]);

  useEffect(() => {
    const handleRoomData = ({ users: roomUsers, messages: roomMessages }) => {
      setUsers(roomUsers || []);
      setMessages(roomMessages || []);
      setReady(true);
    };

    const handleReceiveMessage = (message) => {
      setMessages((state) => [...state, message]);
      if (!visibleRef.current) {
        setUnreadCount((value) => value + 1);
      }
    };

    const handleSystemMessage = (message) => {
      setMessages((state) => [...state, message]);
      if (!visibleRef.current) {
        setUnreadCount((value) => value + 1);
      }
    };

    const handleUserList = (roomUsers) => setUsers(roomUsers || []);
    const handleTypingUpdate = (typingList) => setTypingUsers(typingList || []);
    const handleConnected = () => setStatus("connected");
    const handleDisconnected = () => setStatus("disconnected");
    const handleReconnecting = () => setStatus("reconnecting");

    socket.on("room_data", handleRoomData);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("system_message", handleSystemMessage);
    socket.on("user_list", handleUserList);
    socket.on("typing_update", handleTypingUpdate);
    socket.on("connect", handleConnected);
    socket.on("disconnect", handleDisconnected);
    socket.on("reconnect_attempt", handleReconnecting);

    return () => {
      socket.off("room_data", handleRoomData);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("system_message", handleSystemMessage);
      socket.off("user_list", handleUserList);
      socket.off("typing_update", handleTypingUpdate);
      socket.off("connect", handleConnected);
      socket.off("disconnect", handleDisconnected);
      socket.off("reconnect_attempt", handleReconnecting);
    };
  }, [socket]);

  useEffect(() => {
    return () => {
      socket.emit("stop_typing", { room: roomCode });
    };
  }, [roomCode, socket]);

  const handleSend = (payload) => {
    if (typeof payload === "string") {
      const trimmed = payload.trim();
      if (!trimmed) return;
      socket.emit("send_message", {
        room: roomCode,
        author: currentUser,
        message: trimmed,
        type: "text",
      });
    } else {
      socket.emit("send_message", {
        room: roomCode,
        author: currentUser,
        ...payload,
      });
    }
  };

  const handleTyping = (isTyping) => {
    socket.emit(isTyping ? "typing" : "stop_typing", {
      room: roomCode,
      name: currentUser,
    });
  };

  const confirmLeave = () => {
    onLeave();
    setShowLeaveConfirm(false);
  };

  const typingText = formatTyping(typingUsers, currentUser);

  return (
    <div className="chat-layout-wrapper">
      
      {/* Desktop Sidebar */}
      <div className="desktop-only sidebar-container">
        <Sidebar 
          users={users} 
          currentUser={currentUser} 
          roomCode={roomCode} 
          onLeave={() => setShowLeaveConfirm(true)} 
        />
      </div>

      {/* Mobile Drawer */}
      {showMobileSidebar && (
        <div className="mobile-drawer-overlay" onClick={() => setShowMobileSidebar(false)}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <Sidebar 
              users={users} 
              currentUser={currentUser} 
              roomCode={roomCode} 
              onLeave={() => {
                setShowMobileSidebar(false);
                setShowLeaveConfirm(true);
              }} 
            />
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="chat-main-area">
        <Header
          roomCode={roomCode}
          userCount={users.length}
          onToggleSidebar={() => setShowMobileSidebar(true)}
          status={status}
          unreadCount={unreadCount}
        />

        <div className="chat-feed" ref={feedRef}>
          {!ready ? (
            <div className="empty-state">Connecting to the room...</div>
          ) : messages.length === 0 ? (
            <div className="empty-state">Start the conversation with your first message.</div>
          ) : (
            messages.map((message) =>
              message.type === "system" ? (
                <NotificationMessage key={message.id} text={message.text} />
              ) : (
                <MessageBubble 
                  key={message.id} 
                  message={message} 
                  currentUser={currentUser} 
                  roomSize={users.length} 
                />
              ),
            )
          )}
          {typingText ? <div className="typing-indicator">{typingText}</div> : null}
          <div ref={messagesEndRef} className="message-end-marker" />
        </div>

        <div className="composer-container">
          <MessageInput onSend={handleSend} onTyping={handleTyping} />
        </div>
      </div>

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="modal-overlay">
          <div className="modal-card glass-card">
            <h3>Leave Room?</h3>
            <p>Are you sure you want to leave room {roomCode}? You will need the code to rejoin.</p>
            <div className="modal-actions">
              <button className="secondary-button" onClick={() => setShowLeaveConfirm(false)}>Cancel</button>
              <button className="danger-button" onClick={confirmLeave}>Leave</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;

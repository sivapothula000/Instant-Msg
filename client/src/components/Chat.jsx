import React, { useEffect, useRef, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import NotificationMessage from "./NotificationMessage";
import SettingsPanel from "./SettingsPanel";
import { isSameDay, formatDateSeparator } from "../utils/dateUtils";

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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    theme: "dark",
    notificationSounds: true,
    bubbleSize: "medium",
    fontSize: "medium",
    autoScroll: true,
    showTimestamps: true,
    showJoinNotifications: true,
  });
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== "undefined" && window.visualViewport 
      ? window.visualViewport.height 
      : typeof window !== "undefined" ? window.innerHeight : "100dvh"
  );

  const messagesEndRef = useRef(null);
  const feedRef = useRef(null);
  const visibleRef = useRef(true);
  const isNearBottomRef = useRef(true);
  const hasHydratedSettingsRef = useRef(false);
  const initialMessagesLoadedRef = useRef(false);

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
    const handleVisualViewport = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);

        if (isNearBottomRef.current && messagesEndRef.current) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
          }, 50);
        }
      }
    };

    if (window.visualViewport) {
      handleVisualViewport();
      window.visualViewport.addEventListener("resize", handleVisualViewport);
      window.visualViewport.addEventListener("scroll", handleVisualViewport);
    } else {
      const handleResizeFallback = () => setViewportHeight(window.innerHeight);
      window.addEventListener("resize", handleResizeFallback);
      return () => {
        window.removeEventListener("resize", handleResizeFallback);
      };
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleVisualViewport);
        window.visualViewport.removeEventListener("scroll", handleVisualViewport);
      }
    };
  }, []);

  useEffect(() => {
    if (!settingsOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [settingsOpen]);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("instant-msg-settings") : null;
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (error) {
        console.warn("Failed to read saved settings", error);
      }
    }
    hasHydratedSettingsRef.current = true;
  }, []);

  useEffect(() => {
    if (!hasHydratedSettingsRef.current) return;
    window.localStorage.setItem("instant-msg-settings", JSON.stringify(settings));
    document.body.dataset.theme = settings.theme;
    document.body.dataset.bubbleSize = settings.bubbleSize;
    document.body.dataset.fontSize = settings.fontSize;
  }, [settings]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  const handleFeedScroll = () => {
    const feed = feedRef.current;
    if (!feed) return;
    const distanceFromBottom = feed.scrollHeight - (feed.scrollTop + feed.clientHeight);
    const nearBottom = distanceFromBottom <= 140;
    isNearBottomRef.current = nearBottom;
    setIsNearBottom(nearBottom);
    if (nearBottom) {
      setNewMessageCount(0);
    }
  };

  useEffect(() => {
    const latest = messages[messages.length - 1];
    if (!latest || !messagesEndRef.current) return;
    const isOwnMessage = latest.author === currentUser;
    const isSystem = latest.type === "system";
    const shouldScroll =
      isOwnMessage ||
      (settings.autoScroll && (isNearBottom || !initialMessagesLoadedRef.current));

    if (shouldScroll) {
      scrollToBottom();
      setNewMessageCount(0);
    } else if (!isOwnMessage && !isSystem) {
      setNewMessageCount((count) => count + 1);
    }

    initialMessagesLoadedRef.current = true;
  }, [messages, isNearBottom, settings.autoScroll, currentUser]);

  useEffect(() => {
    const handleRoomData = ({ users: roomUsers, messages: roomMessages }) => {
      setUsers(roomUsers || []);
      setMessages(roomMessages || []);
      setReady(true);
    };

    const playNotificationSound = () => {
      if (!settings.notificationSounds || typeof window === "undefined") return;
      try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(440, context.currentTime);
        gain.gain.setValueAtTime(0.07, context.currentTime);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.05);
        oscillator.onended = () => context.close();
      } catch (error) {
        console.warn("Notification sound blocked or unsupported", error);
      }
    };

    const handleReceiveMessage = (message) => {
      setMessages((state) => [...state, message]);
      if (!visibleRef.current) {
        setUnreadCount((value) => value + 1);
      }
      if (message.author !== currentUser && message.type !== "system") {
        playNotificationSound();
      }
    };

    const handleSystemMessage = (message) => {
      if (!settings.showJoinNotifications && message.type === "system") {
        return;
      }
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
    <div 
      className="chat-layout-wrapper"
      style={{ height: typeof viewportHeight === "number" ? `${viewportHeight}px` : viewportHeight }}
    >
      
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
          onOpenSettings={() => setSettingsOpen(true)}
          status={status}
          unreadCount={unreadCount}
        />

        <div className="chat-feed" ref={feedRef} onScroll={handleFeedScroll}>
          {!ready ? (
            <div className="empty-state">Connecting to the room...</div>
          ) : messages.length === 0 ? (
            <div className="empty-state">Start the conversation with your first message.</div>
          ) : (
            messages.map((message, index) => {
              const prevMessage = index > 0 ? messages[index - 1] : null;
              // Only show separator if both have timestamps and they are on different days (or if it's the first message)
              const showDateSeparator = message.timestamp && (!prevMessage || !prevMessage.timestamp || !isSameDay(prevMessage.timestamp, message.timestamp));
              
              return (
                <React.Fragment key={message.id}>
                  {showDateSeparator && (
                    <div className="date-separator animate-fade-in-down">
                      <span>{formatDateSeparator(message.timestamp)}</span>
                    </div>
                  )}
                  {message.type === "system" ? (
                    <NotificationMessage message={message} />
                  ) : (
                    <MessageBubble 
                      message={message} 
                      currentUser={currentUser} 
                      roomSize={users.length} 
                      showTimestamps={settings.showTimestamps}
                    />
                  )}
                </React.Fragment>
              );
            })
          )}
          {typingText ? <div className="typing-indicator">{typingText}</div> : null}
          <div ref={messagesEndRef} className="message-end-marker" />
          {!isNearBottom && newMessageCount > 0 && (
            <button className="new-message-button" onClick={scrollToBottom}>
              {newMessageCount} new message{newMessageCount > 1 ? "s" : ""}
            </button>
          )}
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
      {settingsOpen && (
        <SettingsPanel
          settings={settings}
          onUpdate={setSettings}
          onClose={() => setSettingsOpen(false)}
          roomCode={roomCode}
          onLeave={confirmLeave}
        />
      )}
    </div>
  );
}

export default Chat;

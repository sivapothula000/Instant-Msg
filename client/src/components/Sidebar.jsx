import { FiCopy, FiLogOut, FiUsers } from "react-icons/fi";

export const getAvatarColor = (name) => {
  if (!name) return "linear-gradient(135deg, #d4af37, #f3e5ab)";
  const colors = [
    "linear-gradient(135deg, #FF6B6B, #FF8E8E)",
    "linear-gradient(135deg, #4E65FF, #92EFFD)",
    "linear-gradient(135deg, #13E0E8, #6DE9E3)",
    "linear-gradient(135deg, #F3904F, #3B4371)",
    "linear-gradient(135deg, #30CFD0, #330867)",
    "linear-gradient(135deg, #FF0844, #FFB199)",
    "linear-gradient(135deg, #F12711, #F5AF19)",
    "linear-gradient(135deg, #65FDF0, #1D6FA5)",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

function Sidebar({ users, currentUser, roomCode, onLeave }) {
  const copyRoom = () => {
    navigator.clipboard.writeText(roomCode).catch(() => {});
  };

  return (
    <div className="sidebar glass-card">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="logo-badge">IM</div>
          <h2>Instant Msg</h2>
        </div>
        <div className="room-info-card">
          <div>
            <p className="room-label">Room Code</p>
            <p className="room-code-text">{roomCode}</p>
          </div>
          <button className="icon-button" onClick={copyRoom} title="Copy Room Code">
            <FiCopy />
          </button>
        </div>
      </div>

      <div className="sidebar-online">
        <div className="online-header">
          <FiUsers className="online-icon" />
          <span className="online-title">Online Users</span>
          <span className="online-count-badge">{users.length}</span>
        </div>
        
        <div className="online-list">
          {users.map((username) => (
            <div key={username} className={`online-user ${username === currentUser ? "current" : ""}`}>
              <div 
                className="user-avatar" 
                style={{ background: getAvatarColor(username) }}
              >
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-name">{username} {username === currentUser ? "(You)" : ""}</span>
                <span className="user-status-text">Online</span>
              </div>
              <span className="presence-dot" />
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-footer">
        <button className="danger-button leave-button-full" onClick={onLeave}>
          <FiLogOut /> Leave Room
        </button>
      </div>
    </div>
  );
}

export default Sidebar;

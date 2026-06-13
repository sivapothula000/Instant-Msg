import { FiMenu, FiSettings } from "react-icons/fi";

function Header({ roomCode, userCount, onToggleSidebar, onOpenSettings, status, unreadCount }) {
  return (
    <div className="chat-main-header glass-card">
      <div className="header-mobile-left">
        <button type="button" className="icon-button mobile-only" onClick={onToggleSidebar} title="Open Menu">
          <FiMenu />
          {unreadCount > 0 && <span className="mobile-unread-badge" />}
        </button>
        <div className="mobile-only mobile-brand">
          <span className="app-title-small">Instant Msg</span>
        </div>
      </div>

      <div className="header-desktop-left desktop-only">
        <span className="header-room-badge">#{roomCode}</span>
        <span className="header-user-count">{userCount} online</span>
      </div>

      <div className="header-right">
        <span className={`connection-badge ${status}`}>{status}</span>
        <button type="button" className="icon-button" title="Settings" onClick={onOpenSettings}>
          <FiSettings />
        </button>
      </div>
    </div>
  );
}

export default Header;

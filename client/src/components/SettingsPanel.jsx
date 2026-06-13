import { FiX, FiCopy, FiLogOut } from "react-icons/fi";

function SettingsPanel({ settings, onUpdate, onClose, roomCode, onLeave }) {
  const update = (field, value) => {
    onUpdate({ ...settings, [field]: value });
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode).catch(() => {});
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-panel glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h3>Settings</h3>
          <button className="icon-button" onClick={onClose} title="Close settings">
            <FiX />
          </button>
        </div>

        <div className="settings-section">
          <div className="settings-item">
            <label>Theme</label>
            <div className="settings-radio-group">
              {[
                { label: "Dark", value: "dark" },
                { label: "Light", value: "light" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`settings-choice ${settings.theme === option.value ? "active" : ""}`}
                  onClick={() => update("theme", option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-item">
            <label>Notification sounds</label>
            <button
              type="button"
              className={`settings-toggle ${settings.notificationSounds ? "active" : ""}`}
              onClick={() => update("notificationSounds", !settings.notificationSounds)}
            >
              {settings.notificationSounds ? "On" : "Off"}
            </button>
          </div>

          <div className="settings-item">
            <label>Auto scroll</label>
            <button
              type="button"
              className={`settings-toggle ${settings.autoScroll ? "active" : ""}`}
              onClick={() => update("autoScroll", !settings.autoScroll)}
            >
              {settings.autoScroll ? "Enabled" : "Disabled"}
            </button>
          </div>

          <div className="settings-item">
            <label>Show timestamps</label>
            <button
              type="button"
              className={`settings-toggle ${settings.showTimestamps ? "active" : ""}`}
              onClick={() => update("showTimestamps", !settings.showTimestamps)}
            >
              {settings.showTimestamps ? "Visible" : "Hidden"}
            </button>
          </div>

          <div className="settings-item">
            <label>Join notifications</label>
            <button
              type="button"
              className={`settings-toggle ${settings.showJoinNotifications ? "active" : ""}`}
              onClick={() => update("showJoinNotifications", !settings.showJoinNotifications)}
            >
              {settings.showJoinNotifications ? "Show" : "Hide"}
            </button>
          </div>

          <div className="settings-item">
            <label>Bubble size</label>
            <div className="settings-radio-group">
              {[
                { label: "Small", value: "small" },
                { label: "Medium", value: "medium" },
                { label: "Large", value: "large" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`settings-choice ${settings.bubbleSize === option.value ? "active" : ""}`}
                  onClick={() => update("bubbleSize", option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-item">
            <label>Font size</label>
            <div className="settings-radio-group">
              {[
                { label: "Small", value: "small" },
                { label: "Medium", value: "medium" },
                { label: "Large", value: "large" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`settings-choice ${settings.fontSize === option.value ? "active" : ""}`}
                  onClick={() => update("fontSize", option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button type="button" className="icon-button" onClick={copyRoomCode} title="Copy room code">
            <FiCopy />
            <span>Copy Room Code</span>
          </button>
          <button type="button" className="danger-button" onClick={onLeave}>
            <FiLogOut />
            <span>Leave Room</span>
          </button>
        </div>

        <div className="settings-about">
          <p><strong>Instant Msg</strong> is a lightweight chat experience with typing indicators, voice messages, and room-based sharing.</p>
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;

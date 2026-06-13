import { formatMessageTimestamp } from "../utils/dateUtils";

function NotificationMessage({ message }) {
  return (
    <div className="notification-row animate-fade-in-down">
      <div className="notification-pill">
        <span className="notification-text">{message.text}</span>
        {message.timestamp && (
          <span className="notification-time" style={{ opacity: 0.7, marginLeft: 4 }}>
            • {formatMessageTimestamp(message.timestamp)}
          </span>
        )}
      </div>
    </div>
  );
}

export default NotificationMessage;

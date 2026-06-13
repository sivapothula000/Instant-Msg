function NotificationMessage({ text }) {
  return (
    <div className="notification-row animate-fade-in-down">
      <div className="notification-pill">
        <span className="notification-text">{text}</span>
      </div>
    </div>
  );
}

export default NotificationMessage;

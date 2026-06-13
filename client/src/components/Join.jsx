import { useMemo, useState } from "react";
import { generateRoomCode } from "../utils/generateRoomCode";

function Join({ onJoin, joinPending, errorMessage, status, defaultRoom }) {
  const [name, setName] = useState("");
  const [room, setRoom] = useState(defaultRoom || "");

  const roomCode = useMemo(() => room.toUpperCase(), [room]);

  const createRoom = () => {
    const code = generateRoomCode();
    setRoom(code);
    navigator.clipboard.writeText(code).catch(() => {});
  };

  const shareRoom = () => {
    if (!roomCode) return;
    if (navigator.share) {
      navigator.share({
        title: `Join my Instant Msg room ${roomCode}`,
        text: `Join me in Instant Msg room ${roomCode}`,
      }).catch(() => {});
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onJoin({ name, room: roomCode });
  };

  return (
    <div className="join-shell">
      <div className="join-card glass-card">
        <div className="brand-block">
          <div className="brand-mark">IM</div>
          <div>
            <h1>Instant Msg</h1>
            <p>Premium real-time encrypted chat.</p>
          </div>
        </div>

        <form className="join-form" onSubmit={handleSubmit}>
          <label>
            Username
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your username"
              spellCheck="false"
            />
          </label>

          <label>
            Room Code
            <div className="room-field">
              <input
                value={roomCode}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Room code or create one"
                spellCheck="false"
                maxLength={6}
              />
              <button type="button" className="secondary-button create-btn" onClick={createRoom}>
                Generate
              </button>
            </div>
          </label>

          <div className="join-actions">
            <button type="submit" className="primary-button" disabled={joinPending}>
              {joinPending ? "Connecting..." : "Join Room"}
            </button>
            <button type="button" className="secondary-button" onClick={shareRoom}>
              Share
            </button>
          </div>

          <div className="status-row">
            <span className={`status-chip ${status}`}>
              <span className="status-dot"></span>
              {status}
            </span>
            {errorMessage ? <span className="error-text">{errorMessage}</span> : null}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Join;

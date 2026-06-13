import { useState, useRef, useEffect } from "react";
import { getAvatarColor } from "./Sidebar";
import { FiPlay, FiPause, FiCheck } from "react-icons/fi";

function AudioPlayer({ audioData }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioData) {
      audioRef.current = new Audio(audioData);
      audioRef.current.addEventListener("loadedmetadata", () => {
        setDuration(audioRef.current.duration);
      });
      audioRef.current.addEventListener("timeupdate", () => {
        setProgress(audioRef.current.currentTime);
      });
      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
        setProgress(0);
      });
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioData]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="audio-player">
      <button className="audio-play-button" onClick={togglePlay} title="Play/Pause">
        {isPlaying ? <FiPause /> : <FiPlay />}
      </button>
      <div className="audio-waveform-bar">
        <div 
          className="audio-progress" 
          style={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }}
        />
      </div>
      <span className="audio-time">{formatTime(progress > 0 ? progress : duration)}</span>
    </div>
  );
}

function MessageBubble({ message, currentUser, roomSize }) {
  const own = message.author === currentUser;
  
  const renderStatus = () => {
    if (!own) return null;
    if (roomSize > 1) {
      return (
        <span className="msg-status read" title="Read">
          <FiCheck /><FiCheck style={{ marginLeft: "-8px" }} />
        </span>
      );
    }
    return (
      <span className="msg-status sent" title="Sent">
        <FiCheck />
      </span>
    );
  };

  return (
    <div className={`message-row ${own ? "message-row-own" : "message-row-other"}`}>
      {!own && (
        <div 
          className="message-avatar" 
          style={{ background: getAvatarColor(message.author) }}
        >
          {message.author.charAt(0).toUpperCase()}
        </div>
      )}
      
      <div className={`message-bubble ${own ? "bubble-own" : "bubble-other"}`}>
        {!own && <div className="message-author">{message.author}</div>}
        
        <div className="message-content">
          {message.type === "audio" ? (
            <AudioPlayer audioData={message.audioData} />
          ) : (
            <p>{message.message}</p>
          )}
        </div>
        
        <div className="message-meta">
          <span className="message-time">{message.time}</span>
          {renderStatus()}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;

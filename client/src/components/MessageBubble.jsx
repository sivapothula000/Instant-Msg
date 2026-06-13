import { useState, useRef, useEffect } from "react";
import { getAvatarColor } from "./Sidebar";
import { FiPlay, FiPause, FiCheck } from "react-icons/fi";
import { formatMessageTimestamp } from "../utils/dateUtils";

let currentlyPlayingAudio = null;

function AudioPlayer({ audioData }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const waveformRef = useRef(null);

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
      audioRef.current.addEventListener("pause", () => {
        setIsPlaying(false);
      });
      audioRef.current.addEventListener("play", () => {
        setIsPlaying(true);
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
      if (currentlyPlayingAudio && currentlyPlayingAudio !== audioRef.current) {
        currentlyPlayingAudio.pause();
      }
      audioRef.current.play().catch(() => {});
      currentlyPlayingAudio = audioRef.current;
    }
  };

  const handleSeek = (e) => {
    if (!waveformRef.current || !audioRef.current || duration === 0) return;
    
    const rect = waveformRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    
    const percentage = Math.max(0, Math.min(1, clickX / width));
    const newTime = percentage * duration;
    
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
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
      <div 
        className="audio-waveform-bar" 
        ref={waveformRef}
        onClick={handleSeek}
        style={{ cursor: "pointer" }}
      >
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
          <span className="message-time">{message.timestamp ? formatMessageTimestamp(message.timestamp) : message.time}</span>
          {renderStatus()}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;

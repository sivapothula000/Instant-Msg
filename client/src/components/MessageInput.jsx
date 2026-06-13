import { useEffect, useMemo, useState, useRef } from "react";
import { FiSmile, FiSend, FiMic, FiSquare, FiTrash2 } from "react-icons/fi";

function MessageInput({ onSend, onTyping }) {
  const [text, setText] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const textareaRef = useRef(null);

  const emojis = useMemo(
    () => ["😀", "😄", "😉", "😍", "🤔", "👍", "🎉", "💬", "🔥", "✨"],
    []
  );

  useEffect(() => {
    return () => {
      onTyping(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, [onTyping]);

  const handleSendText = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
    onTyping(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleSendAudio = () => {
    if (!audioBlob) return;
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = () => {
      onSend({ type: "audio", audioData: reader.result });
      setAudioBlob(null);
      setRecordingTime(0);
    };
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      alert("Microphone access is required to send voice messages.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    clearInterval(timerRef.current);
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendText();
    }
  };

  const handleChange = (event) => {
    setText(event.target.value);
    onTyping(Boolean(event.target.value.trim()));
    
    // Auto-resize textarea
    event.target.style.height = "auto";
    event.target.style.height = `${Math.min(event.target.scrollHeight, 120)}px`;
  };

  const addEmoji = (emoji) => {
    setText((value) => `${value}${emoji}`);
    setPickerOpen(false);
    onTyping(true);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="composer-wrapper">
      {pickerOpen && (
        <div className="emoji-picker glass-card">
          {emojis.map((emoji) => (
            <button key={emoji} type="button" onClick={() => addEmoji(emoji)}>
              {emoji}
            </button>
          ))}
        </div>
      )}

      {isRecording ? (
        <div className="audio-recording-bar">
          <div className="recording-indicator">
            <span className="pulsing-dot" />
            <span className="recording-time">{formatTime(recordingTime)}</span>
          </div>
          <div className="recording-actions">
            <button className="icon-button danger" onClick={cancelRecording} title="Cancel">
              <FiTrash2 />
            </button>
            <button className="icon-button primary" onClick={stopRecording} title="Stop & Preview">
              <FiSquare />
            </button>
          </div>
        </div>
      ) : audioBlob ? (
        <div className="audio-preview-bar">
          <div className="audio-preview-info">
            <FiMic className="preview-icon" />
            <span>Voice Message ({formatTime(recordingTime)})</span>
          </div>
          <div className="recording-actions">
            <button className="icon-button danger" onClick={cancelRecording} title="Delete">
              <FiTrash2 />
            </button>
            <button className="send-button primary-gradient" onClick={handleSendAudio} title="Send">
              <FiSend />
            </button>
          </div>
        </div>
      ) : (
        <div className="message-input-container">
          <button type="button" className="action-button" onClick={() => setPickerOpen(!pickerOpen)}>
            <FiSmile />
          </button>
          
          <textarea
            ref={textareaRef}
            className="message-textarea"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
          />
          
          <div className="input-actions-right">
            {text.trim() ? (
              <button type="button" className="send-button primary-gradient animated-pop" onClick={handleSendText}>
                <FiSend />
              </button>
            ) : (
              <button type="button" className="action-button" onClick={startRecording} title="Hold to record">
                <FiMic />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageInput;

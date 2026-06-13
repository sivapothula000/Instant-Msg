# Instant Msg

Instant Msg is a premium, real-time private room chat application designed with a sleek Midnight Luxury (Gold & Obsidian) aesthetic. It enables instant text and voice messaging without the need for accounts or databases—all communication is temporary and secure.

## Features

- **Instant Rooms**: Generate or join unique 6-character room codes.
- **Premium Design System**: "Gold & Obsidian" luxury dark mode theme with glassmorphism, floating shadows, and subtle background animations.
- **Real-Time Communication**: Powered by Socket.IO for sub-second message delivery.
- **Voice Messaging**: Integrated MediaRecorder API for recording, previewing, and sending high-quality voice notes directly within the chat.
- **Smart Delivery Status**: Real-time read receipts (✓ Sent, ✓✓ Read) based on active room participants.
- **Typing Indicators**: See when others are typing in real-time.
- **Responsive Layout**: Works flawlessly on Desktop, Tablet, and Mobile with a specialized drawer interface for smaller screens.

## Architecture & Tech Stack

### Frontend
- **React 19 & Vite**: Ultra-fast component rendering and hot-module replacement.
- **CSS3 Variables & Animations**: Custom design system without heavy UI libraries.
- **Socket.IO Client**: Persistent WebSocket connections with automatic reconnection handling.
- **MediaRecorder API**: Native browser API for capturing audio streams.

### Backend
- **Node.js & Express**: Lightweight HTTP server.
- **Socket.IO Server**: Manages WebSocket connections, namespaces, and room clustering.
- **In-Memory State**: Messages and users are stored temporarily in memory. When a room is empty, all data is securely wiped.

## Folder Structure

```text
instant-msg/
├── client/                 # React Frontend
│   ├── public/             # Static assets (manifest, favicon)
│   ├── src/
│   │   ├── components/     # React components (Chat, Join, MessageInput, etc.)
│   │   ├── styles/         # CSS style sheets
│   │   └── utils/          # Helper functions
│   └── package.json        # Frontend dependencies
├── server/                 # Node.js Backend
│   ├── server.js           # Socket.IO and Express setup
│   └── package.json        # Backend dependencies
└── README.md               # Project documentation
```

## Running Locally

1. **Clone the repository.**
2. **Start the Backend:**
   ```bash
   cd server
   npm install
   npm run dev
   ```
   *The server runs on `http://localhost:5000`.*
   
3. **Start the Frontend:**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   *The client runs on `http://localhost:5173`.*

## Deployment Setup

### Backend (Render / Heroku)
1. Deploy the `server` folder.
2. The server will automatically use `process.env.PORT`.

### Frontend (Vercel / Netlify)
1. Deploy the `client` folder.
2. Set the build command to `npm run build` and publish directory to `dist`.
3. **Environment Variables**: Add `VITE_SOCKET_URL` pointing to your deployed backend URL (e.g., `https://instant-msg-api.onrender.com`).

## Future Enhancements
- End-to-End Encryption (E2EE) for messages using Web Crypto API.
- Multimedia support (Image/Video sharing).
- WebRTC integration for direct peer-to-peer audio calls.

## License
MIT License

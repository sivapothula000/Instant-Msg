export const getSocketUrl = () => {
  if (import.meta.env.VITE_SERVER_URL) {
    return import.meta.env.VITE_SERVER_URL;
  }

  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  if (import.meta.env.PROD) {
    return "https://instant-msg-s0q9.onrender.com/";
  }

  return "https://instant-msg-s0q9.onrender.com/";
};

const config = {
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000",
  websocketUrl: process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8000",
};

export default config;

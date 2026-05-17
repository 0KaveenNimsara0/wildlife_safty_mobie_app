// config/api.ts
// 10.0.2.2 is the Android emulator's alias for your host machine's localhost.
// This means you NEVER need to manually update the IP address during development.
// Just make sure:
//   1. Your backend is running on localhost:5000
//   2. You ran: adb reverse tcp:5000 tcp:5000

// If using a PHYSICAL device over USB, run `adb reverse tcp:5000 tcp:5000` and use localhost.
// If using a PHYSICAL device over WiFi, set USE_PHYSICAL_DEVICE = true and enter your LAN IP.

const USE_PHYSICAL_DEVICE = true;
const PHYSICAL_DEVICE_IP = '192.168.1.5'; // Only used when USE_PHYSICAL_DEVICE is true

const BASE_HOST = USE_PHYSICAL_DEVICE ? PHYSICAL_DEVICE_IP : '10.0.2.2';
const BASE_PORT = '5000';
const BASE_PREDICTION_PORT = '5001';

export const API_URL = `http://${BASE_HOST}:${BASE_PORT}/api`;
export const PREDICTION_API_URL = `http://${BASE_HOST}:${BASE_PREDICTION_PORT}/predict`;

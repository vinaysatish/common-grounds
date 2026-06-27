import { initializeApp } from "firebase/app";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// Dev-only: route all Realtime Database traffic to the local Firebase emulator.
// Host defaults to the hostname the page was served from, so the same dev
// server works from the Mac (localhost) and from phones on the LAN (the Mac's
// IP) with no per-device config. Override with VITE_EMULATOR_HOST if needed.
if (import.meta.env.VITE_USE_EMULATOR === "true") {
  const host =
    import.meta.env.VITE_EMULATOR_HOST ||
    (typeof window !== "undefined" && window.location.hostname) ||
    "127.0.0.1";
  const port = Number(import.meta.env.VITE_EMULATOR_DB_PORT || 9000);
  connectDatabaseEmulator(db, host, port);
}

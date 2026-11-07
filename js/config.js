/**
 * Firebase configuration (Firebase Console → Project settings → Your apps → Web app).
 *
 * While `apiKey` is empty the app runs in DEMO MODE: a fake "Sign in with
 * Google" button and data saved in this browser's localStorage. With the
 * values below, real Google login and the Firestore database are used.
 *
 * Web API keys identify your project; they are not secret. Access is
 * protected by your Firestore security rules, not by hiding this file.
 */
export const firebaseConfig = {
  apiKey: "AIzaSyAPZqhQfT3BY7Ywu6fiFB8Zq5kvmdhyGu0",
  authDomain: "fitplan-73214.firebaseapp.com",
  projectId: "fitplan-73214",
  storageBucket: "fitplan-73214.firebasestorage.app",
  messagingSenderId: "408562864972",
  appId: "1:408562864972:web:0376dd2f634b1d71a375e9",
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

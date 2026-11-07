import { isFirebaseConfigured } from "./config.js";
import { getFirebase } from "./firebase.js";

export const isDemoMode = !isFirebaseConfigured;

const DEMO_KEY = "fitplan:demo-user";
const demoListeners = new Set();

const toUser = (u) => ({
  uid: u.uid,
  name: u.displayName || u.email || "Athlete",
  email: u.email || "",
  photo: u.photoURL || null,
});

function readDemoUser() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_KEY));
  } catch {
    return null;
  }
}

const notifyDemo = () => demoListeners.forEach((cb) => cb(readDemoUser()));

/** Calls `callback(user | null)` now and whenever the sign-in state changes. */
export async function onAuthChange(callback) {
  const fb = await getFirebase();
  if (fb) {
    return fb.authMod.onAuthStateChanged(fb.auth, (u) => callback(u ? toUser(u) : null));
  }
  demoListeners.add(callback);
  callback(readDemoUser());
  return () => demoListeners.delete(callback);
}

export async function signInWithGoogle() {
  const fb = await getFirebase();
  if (fb) {
    const provider = new fb.authMod.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await fb.authMod.signInWithPopup(fb.auth, provider);
    return;
  }
  const demoUser = { uid: "demo", name: "Demo User", email: "demo@ascend.local", photo: null };
  localStorage.setItem(DEMO_KEY, JSON.stringify(demoUser));
  notifyDemo();
}

export async function signOut() {
  const fb = await getFirebase();
  if (fb) {
    await fb.authMod.signOut(fb.auth);
    return;
  }
  localStorage.removeItem(DEMO_KEY);
  notifyDemo();
}

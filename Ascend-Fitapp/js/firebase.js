import { firebaseConfig, isFirebaseConfigured } from "./config.js";

const CDN = "https://www.gstatic.com/firebasejs/10.14.1";
let cached = null;

/**
 * Lazily loads Firebase from the CDN. Returns `null` in demo mode so the app
 * never touches the network until a real config is provided.
 */
export async function getFirebase() {
  if (!isFirebaseConfigured) return null;
  if (cached) return cached;

  const [appMod, authMod, fsMod] = await Promise.all([
    import(`${CDN}/firebase-app.js`),
    import(`${CDN}/firebase-auth.js`),
    import(`${CDN}/firebase-firestore.js`),
  ]);

  const app = appMod.initializeApp(firebaseConfig);
  cached = { auth: authMod.getAuth(app), db: fsMod.getFirestore(app), authMod, fsMod };
  return cached;
}

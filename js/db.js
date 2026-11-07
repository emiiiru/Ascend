import { getFirebase } from "./firebase.js";

/**
 * A "store" keeps one plan document per exercise category for a user:
 *   { categoryId, daysPerWeek, completed, log, weeksCompleted, startedAt, updatedAt }
 *
 * Both implementations expose the same two methods, so the rest of the app
 * does not care whether data lives in Firestore or in localStorage.
 *   list() -> Promise<Plan[]>
 *   save(plan) -> Promise<void>
 */

function firestoreStore(fb, uid) {
  const { collection, doc, getDocs, setDoc } = fb.fsMod;
  const plans = collection(fb.db, "users", uid, "plans");

  return {
    async list() {
      const snapshot = await getDocs(plans);
      return snapshot.docs.map((d) => d.data());
    },
    async save(plan) {
      await setDoc(doc(plans, plan.categoryId), plan);
    },
  };
}

function localStore(uid) {
  const key = `fitplan:plans:${uid}`;
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? {};
    } catch {
      return {};
    }
  };

  return {
    async list() {
      return Object.values(read());
    },
    async save(plan) {
      localStorage.setItem(key, JSON.stringify({ ...read(), [plan.categoryId]: plan }));
    },
  };
}

export async function createStore(uid) {
  const fb = await getFirebase();
  return fb ? firestoreStore(fb, uid) : localStore(uid);
}

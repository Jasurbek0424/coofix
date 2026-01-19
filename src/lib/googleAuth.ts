import { signInWithPopup, getIdToken } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

export const signInWithGoogle = async (): Promise<string> => {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized. Make sure you're in a browser environment.");
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await getIdToken(result.user);
    return idToken;
  } catch (error) {
    console.error("Firebase Google Sign-In error:", error);
    throw error instanceof Error ? error : new Error("Failed to sign in with Google");
  }
};

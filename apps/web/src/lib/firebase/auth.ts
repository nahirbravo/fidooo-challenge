import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOutFn,
  onAuthStateChanged as firebaseOnAuthStateChangedFn,
  onIdTokenChanged as firebaseOnIdTokenChangedFn,
  type User,
  type Unsubscribe,
  type UserCredential,
} from 'firebase/auth';
import { getFirebaseAuth } from './client';

export function firebaseSignIn(
  email: string,
  password: string,
): Promise<UserCredential> {
  return signInWithEmailAndPassword(getFirebaseAuth(), email, password);
}

export function firebaseSignUp(
  email: string,
  password: string,
): Promise<UserCredential> {
  return createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
}

export function firebaseResetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(getFirebaseAuth(), email);
}

export function firebaseSignOut(): Promise<void> {
  return firebaseSignOutFn(getFirebaseAuth());
}

export function firebaseOnAuthStateChanged(
  callback: (user: User | null) => void,
): Unsubscribe {
  return firebaseOnAuthStateChangedFn(getFirebaseAuth(), callback);
}

export function firebaseOnIdTokenChanged(
  callback: (user: User | null) => void,
): Unsubscribe {
  return firebaseOnIdTokenChangedFn(getFirebaseAuth(), callback);
}

export async function firebaseGetIdToken(
  forceRefresh = false,
): Promise<string | null> {
  const user = getFirebaseAuth().currentUser;
  if (!user) return null;
  return user.getIdToken(forceRefresh);
}

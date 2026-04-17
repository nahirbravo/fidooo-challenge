import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }
  return value;
}

export function getFirebaseAdminAuth(): Auth {
  if (!getApps().length) {
    const projectId = getRequiredEnv('FIREBASE_PROJECT_ID');
    const usesEmulator = Boolean(process.env['FIREBASE_AUTH_EMULATOR_HOST']);

    if (usesEmulator) {
      initializeApp({ projectId });
    } else {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail: getRequiredEnv('FIREBASE_CLIENT_EMAIL'),
          privateKey: getRequiredEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  return getAuth();
}

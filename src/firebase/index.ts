'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';

// Singleton instances to prevent multiple initializations during HMR
let firestoreInstance: Firestore | null = null;

/**
 * Initializes Firebase and its services.
 * Ensures Firestore is initialized with long-polling for stability in proxied environments.
 */
export function initializeFirebase() {
  let app: FirebaseApp;
  
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  // Initialize Firestore once with the specific workstation-friendly settings
  if (!firestoreInstance) {
    try {
      firestoreInstance = initializeFirestore(app, {
        experimentalForceLongPolling: true,
      });
    } catch (e) {
      // If already initialized (e.g. by another module), fallback to getFirestore
      firestoreInstance = getFirestore(app);
    }
  }

  return {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: firestoreInstance,
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';

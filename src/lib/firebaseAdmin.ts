import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

type ServiceAccountEnv = {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
};

const getServiceAccountFromEnv = (): ServiceAccountEnv => {
  const privateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const privateKey = privateKeyRaw?.includes("\\n")
    ? privateKeyRaw.replace(/\\n/g, "\n")
    : privateKeyRaw;

  return {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey,
  };
};

export const getAdminAuth = () => {
  if (!getApps().length) {
    const serviceAccount = getServiceAccountFromEnv();
    const hasServiceAccount =
      Boolean(serviceAccount.projectId) &&
      Boolean(serviceAccount.clientEmail) &&
      Boolean(serviceAccount.privateKey);

    initializeApp({
      credential: hasServiceAccount ? cert(serviceAccount) : applicationDefault(),
    });
  }

  return getAuth();
};


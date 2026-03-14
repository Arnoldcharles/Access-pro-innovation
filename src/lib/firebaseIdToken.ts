import { createRemoteJWKSet, jwtVerify } from "jose";

const FIREBASE_JWKS_URL = new URL(
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
);

const jwks = createRemoteJWKSet(FIREBASE_JWKS_URL);

const getFirebaseProjectId = () => {
  // Project ID is not secret; it's safe as NEXT_PUBLIC_.
  return (
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    // Fallback to the hard-coded projectId in src/lib/firebase.ts.
    "accessproinnovation-9355c"
  );
};

export async function verifyFirebaseIdToken(idToken: string) {
  const projectId = getFirebaseProjectId();
  const issuer = `https://securetoken.google.com/${projectId}`;

  const { payload } = await jwtVerify(idToken, jwks, {
    issuer,
    audience: projectId,
  });

  if (!payload.sub) throw new Error("Invalid Firebase ID token (missing sub)");

  return { projectId, uid: String(payload.sub), payload };
}


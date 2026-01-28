import { decodeJwt, jwtVerify, SignJWT } from 'jose';
import type { JWTPayload } from 'jose';

const JWT_SECRET_KEY = 'demo-secret-key';

export type AuthToken = {
  address: string;
  network: string;
};

export type PayloadToken = {
  randomBytes: string;
};

const encoder = new TextEncoder();
const key = encoder.encode(JWT_SECRET_KEY);

export async function createAuthToken(payload: AuthToken): Promise<string> {
  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1Y')
    .sign(key);
}

export async function createPayloadToken(payload: PayloadToken): Promise<string> {
  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(key);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch {
    return null;
  }
}

export function decodeAuthToken(token: string): AuthToken | null {
  try {
    return decodeJwt(token) as unknown as AuthToken;
  } catch {
    return null;
  }
}

import { http, HttpResponse } from 'msw';
import { sha256 } from '@ton/crypto';
import { checkProofDetailed } from '../services/ton-proof.service';
import type { CheckProofPayload, ProofChecks } from '../services/ton-proof.service';
import { TonApiService } from '../services/ton-api.service';
import { createAuthToken, verifyToken } from '../utils/jwt';

interface CheckProofRequest extends CheckProofPayload {
  network: string;
  payloadToken: string;
}

export interface VerifyChecks extends ProofChecks {
  jwtValid: boolean;
  payloadMatch: boolean;
}

export interface CheckProofResponse {
  valid: boolean;
  checks: VerifyChecks;
  token?: string;
  error?: string;
}

export const checkProofHandler = http.post('/api/check_proof', async ({ request }) => {
  const checks: VerifyChecks = {
    jwtValid: false,
    payloadMatch: false,
    publicKeyMatch: false,
    addressMatch: false,
    domainAllowed: false,
    timestampValid: false,
    signatureValid: false
  };

  try {
    const body = await request.json() as CheckProofRequest;

    // 1. Verify JWT payload token
    checks.jwtValid = (await verifyToken(body.payloadToken)) !== null;

    // 2. Check payload token hash matches what wallet signed
    const payloadTokenHash = (await sha256(body.payloadToken)).toString('hex');
    checks.payloadMatch = payloadTokenHash === body.proof.payload;

    // 3. Verify cryptographic proof (signature, address, public key, domain, timestamp)
    const tonApi = new TonApiService(body.network);
    const proofResult = await checkProofDetailed(body, (address) => tonApi.getWalletPublicKey(address));

    // Merge proof checks
    checks.publicKeyMatch = proofResult.checks.publicKeyMatch;
    checks.addressMatch = proofResult.checks.addressMatch;
    checks.domainAllowed = proofResult.checks.domainAllowed;
    checks.timestampValid = proofResult.checks.timestampValid;
    checks.signatureValid = proofResult.checks.signatureValid;

    // Determine overall validity
    const valid = Object.values(checks).every(Boolean);

    if (!valid) {
      let error = 'Verification failed';
      if (!checks.jwtValid) error = 'Invalid JWT token';
      else if (!checks.payloadMatch) error = 'Payload hash mismatch';
      else if (proofResult.error) error = proofResult.error;

      return HttpResponse.json({ valid: false, checks, error } satisfies CheckProofResponse);
    }

    // Create auth token
    const token = await createAuthToken({
      address: body.address,
      network: body.network
    });

    return HttpResponse.json({ valid: true, checks, token } satisfies CheckProofResponse);
  } catch (e) {
    console.error('check_proof error:', e);
    return HttpResponse.json(
      { valid: false, checks, error: 'Invalid request' } satisfies CheckProofResponse,
      { status: 400 }
    );
  }
});

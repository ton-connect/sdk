import { http, HttpResponse } from 'msw';
import { sha256 } from '@ton/crypto';
import { checkProof } from '../services/ton-proof.service';
import type { CheckProofPayload } from '../services/ton-proof.service';
import { TonApiService } from '../services/ton-api.service';
import { createAuthToken, verifyToken } from '../utils/jwt';

interface CheckProofRequest extends CheckProofPayload {
  network: string;
  payloadToken: string;
}

export const checkProofHandler = http.post('/api/check_proof', async ({ request }) => {
  try {
    const body = await request.json() as CheckProofRequest;

    const tonApi = new TonApiService(body.network);

    const isValid = await checkProof(body, (address) => tonApi.getWalletPublicKey(address));

    if (!isValid) {
      return HttpResponse.json(
        { error: 'Invalid proof' },
        { status: 400 }
      );
    }

    // Verify payload token
    const payloadValid = await verifyToken(body.payloadToken);
    if (!payloadValid) {
      return HttpResponse.json(
        { error: 'Invalid payload token' },
        { status: 400 }
      );
    }

    // Check payload token hash matches
    const payloadTokenHash = (await sha256(body.payloadToken)).toString('hex');
    if (payloadTokenHash !== body.proof.payload) {
      return HttpResponse.json(
        { error: 'Payload token hash mismatch' },
        { status: 400 }
      );
    }

    // Create auth token
    const token = await createAuthToken({
      address: body.address,
      network: body.network
    });

    return HttpResponse.json({ token });
  } catch (e) {
    console.error('check_proof error:', e);
    return HttpResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
});

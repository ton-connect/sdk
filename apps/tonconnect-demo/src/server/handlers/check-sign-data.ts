import { http, HttpResponse } from 'msw';
import { verifySignData } from '@/utils/sign-data-verification';
import type { VerificationResult } from '@/utils/sign-data-verification';

interface SignDataRequest {
  address: string;
  network: string;
  public_key: string;
  signature: string;
  timestamp: number;
  domain: string;
  payload: {
    type: 'text' | 'binary' | 'cell';
    text?: string;
    bytes?: string;
    schema?: string;
    cell?: string;
  };
  walletStateInit: string;
}

export const checkSignDataHandler = http.post('/api/check_sign_data', async ({ request }) => {
  try {
    const body = await request.json() as SignDataRequest;

    // Use the same verifier as client
    const result: VerificationResult = await verifySignData({
      response: {
        signature: body.signature,
        timestamp: body.timestamp,
        domain: body.domain,
        payload: body.payload
      },
      address: body.address,
      publicKey: body.public_key,
      walletStateInit: body.walletStateInit
    });

    // Return same format as client verification
    return HttpResponse.json(result);
  } catch (e) {
    console.error('[check_sign_data] Error:', e);
    return HttpResponse.json({
      valid: false,
      message: e instanceof Error ? e.message : 'Verification failed'
    } as VerificationResult);
  }
});

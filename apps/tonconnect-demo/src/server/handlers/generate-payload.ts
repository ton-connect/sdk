import { http, HttpResponse } from 'msw';
import { sha256 } from '@ton/crypto';
import { generateRandomBytes } from '../services/ton-proof.service';
import { createPayloadToken } from '../utils/jwt';

export const generatePayloadHandler = http.post('/api/generate_payload', async () => {
  try {
    const randomBytes = await generateRandomBytes();
    const payloadToken = await createPayloadToken({
      randomBytes: randomBytes.toString('hex')
    });
    const payloadTokenHash = (await sha256(payloadToken)).toString('hex');

    return HttpResponse.json({
      payloadToken,
      payloadTokenHash
    });
  } catch (e) {
    return HttpResponse.json(
      { error: 'Failed to generate payload' },
      { status: 500 }
    );
  }
});

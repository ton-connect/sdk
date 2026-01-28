import { http, HttpResponse } from 'msw';
import { verifyToken, decodeAuthToken } from '../utils/jwt';
import { TonApiService } from '../services/ton-api.service';

export const getAccountInfoHandler = http.get('/api/get_account_info', async ({ request }) => {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);

    // Verify token
    const isValid = await verifyToken(token);
    if (!isValid) {
      return HttpResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Decode token to get address and network
    const decoded = decodeAuthToken(token);
    if (!decoded) {
      return HttpResponse.json(
        { error: 'Could not decode token' },
        { status: 401 }
      );
    }

    // Get account info
    const tonApi = new TonApiService(decoded.network);
    const accountInfo = await tonApi.getAccountInfo(decoded.address);

    return HttpResponse.json(accountInfo);
  } catch (e) {
    console.error('get_account_info error:', e);
    return HttpResponse.json(
      { error: 'Failed to get account info' },
      { status: 500 }
    );
  }
});

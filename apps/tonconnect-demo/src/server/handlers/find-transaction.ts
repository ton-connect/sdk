import { http, HttpResponse } from 'msw';

const ENDPOINTS: Record<string, string> = {
  '-239': 'https://mainnet.tonhubapi.com/jsonRPC',
  '-3': 'https://testnet.tonhubapi.com/jsonRPC'
};

interface FindTransactionRequest {
  messageHash: string;
  network: string;
}

export const findTransactionHandler = http.post('/api/find_transaction', async ({ request }) => {
  try {
    const body = await request.json() as FindTransactionRequest;

    const endpoint = ENDPOINTS[body.network];
    if (!endpoint) {
      return HttpResponse.json(
        { error: 'Unknown network' },
        { status: 400 }
      );
    }

    // This is a simplified implementation for demo purposes.
    // In production, you would use an indexer service like toncenter.com or tonapi.io
    // to search for transactions by normalized hash (TEP-467).
    //
    // The normalized hash is computed from the external message by:
    // 1. Removing the init (stateInit)
    // 2. Setting importFee to 0
    // 3. Removing the src address
    // 4. Storing with forceRef: true
    // 5. Computing cell hash

    return HttpResponse.json({
      found: false,
      message: 'Transaction search by normalized hash is not fully implemented in demo. Use an indexer service like toncenter.com or tonapi.io for production.',
      searchedHash: body.messageHash,
      network: body.network
    });
  } catch (e) {
    console.error('find_transaction error:', e);
    return HttpResponse.json(
      { error: 'Failed to find transaction' },
      { status: 500 }
    );
  }
});

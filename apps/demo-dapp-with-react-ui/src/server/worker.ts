import { http } from 'msw';
import { setupWorker } from 'msw/browser';
import { checkProof } from './api/check-proof';
import { checkSignData } from './api/check-sign-data';
import { createJetton } from './api/create-jetton';
import { generatePayload } from './api/generate-payload';
import { getAccountInfo } from './api/get-account-info';
import { healthz } from './api/healthz';
import { merkleProof } from './api/merkle_proof';
import { findTransactionByExternalMessage } from './api/find-transaction-by-external-message';
import { waitForTransactionResolver } from './api/wait-for-transaction';

const baseUrl = document.baseURI.replace(/\/$/, '');

export const worker = setupWorker(
    http.get(`${baseUrl}/api/healthz`, healthz),
    http.post(`${baseUrl}/api/generate_payload`, generatePayload),
    http.post(`${baseUrl}/api/check_proof`, checkProof),
    http.post(`${baseUrl}/api/check_sign_data`, checkSignData),
    http.get(`${baseUrl}/api/get_account_info`, getAccountInfo),
    http.post(`${baseUrl}/api/create_jetton`, createJetton),
    http.post(`${baseUrl}/api/merkle_proof`, merkleProof),
    http.post(
        `${baseUrl}/api/find_transaction_by_external_message`,
        findTransactionByExternalMessage
    ),
    http.post(`${baseUrl}/api/wait_for_transaction`, waitForTransactionResolver)
);

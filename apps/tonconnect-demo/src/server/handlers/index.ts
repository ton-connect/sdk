import { generatePayloadHandler } from './generate-payload';
import { checkProofHandler } from './check-proof';
import { checkSignDataHandler } from './check-sign-data';
import { getAccountInfoHandler } from './get-account-info';
import { findTransactionHandler } from './find-transaction';

export const handlers = [
  generatePayloadHandler,
  checkProofHandler,
  checkSignDataHandler,
  getAccountInfoHandler,
  findTransactionHandler
];

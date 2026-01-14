import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

export async function startMockServer(): Promise<void> {
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: false
  });
  console.log('[MSW] Mock server started');
}

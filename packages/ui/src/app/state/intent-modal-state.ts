import { createSignal } from 'solid-js';

export type IntentModalState =
    | {
          status: 'opened';
          universalLink: string;
      }
    | {
          status: 'closed';
      };

export const [intentModalState, setIntentModalState] = createSignal<IntentModalState>({
    status: 'closed'
});

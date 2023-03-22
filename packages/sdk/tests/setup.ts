import createFetchMock from 'vitest-fetch-mock';
import { vi } from 'vitest';

export const fetchMocker = createFetchMock(vi);

fetchMocker.enableMocks();

import { useMemo } from 'react';
import { AllureApiClient } from '../api/allure.api';

export function useAllureApi(jwtToken?: string) {
    return useMemo(() => new AllureApiClient({ jwtToken }), [jwtToken]);
}

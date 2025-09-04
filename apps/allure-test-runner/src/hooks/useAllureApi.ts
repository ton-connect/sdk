import { useMemo } from 'react';
import { AllureApiClient } from '../api/allure.api';
import { useAuth } from '../providers/AuthProvider';

export function useAllureApi() {
    const { token } = useAuth() ?? {};
    return useMemo(() => new AllureApiClient({ jwtToken: token }), [token]);
}

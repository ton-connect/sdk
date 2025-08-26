import { useMemo } from 'react';
import { AllureApiClient } from '../api/allure.api';
import { useAuth } from '../context/AuthContext';

export function useAllureApi() {
    const { token } = useAuth() ?? {};
    return useMemo(() => new AllureApiClient({ jwtToken: token }), [token]);
}

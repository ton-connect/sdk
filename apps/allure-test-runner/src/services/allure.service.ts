import type { AllureApiClient } from '../api/allure.api';
import { CUSTOM_FIELD_NAMES, OPERATION_TYPE, type TestResultWithCustomFields } from '../models';

export class AllureService {
    static from(api: AllureApiClient, signal?: AbortSignal) {
        return new AllureService(api, signal);
    }

    api: AllureApiClient;
    signal?: AbortSignal;
    private constructor(api: AllureApiClient, signal: AbortSignal | undefined = undefined) {
        this.api = api;
        this.signal = signal;
    }

    async getWithCustomFields(testId: number): Promise<TestResultWithCustomFields> {
        const [testResult, customFields] = await Promise.all([
            this.api.getTestResult(testId, this.signal),
            this.api.getCustomFields(testId)
        ]);

        const operationType = customFields.find(
            value => value.customField.name === CUSTOM_FIELD_NAMES.OPERATION_TYPE
        );

        return {
            ...testResult,
            customFields: {
                operationType: operationType?.name as keyof typeof OPERATION_TYPE
            }
        };
    }
}

import { Injectable } from '@nestjs/common';
import { AllureApi } from '../api';

@Injectable()
export class AllureService {
    constructor(private readonly api: AllureApi) {}

    async getLaunches(params: {
        projectId: number;
        search?: string;
        page?: number;
        size?: number;
        sort?: string;
    }) {
        return this.api.getLaunches(params);
    }

    async completeLaunch(id: number) {
        await this.api.completeLaunch(id);
    }

    async getLaunchItems(params: {
        launchId: number;
        search?: string;
        page?: number;
        size?: number;
        sort?: string;
    }) {
        return this.api.getLaunchItems(params);
    }

    async getLaunchItemsTree(params: {
        launchId: number;
        search?: string;
        page?: number;
        size?: number;
        path?: number | number[];
    }) {
        return this.api.getLaunchItemsTree(params);
    }

    async getLaunchItemTree(params: { launchId: number; path: number | number[] }) {
        return this.api.getLaunchItemTree(params);
    }

    async getTestResult(id: number) {
        return this.api.getTestResult(id);
    }

    async getTestResultWithCustomFields(id: number) {
        const [test, customFields, execution] = await Promise.all([
            this.api.getTestResult(id),
            this.api.getCustomFields(id),
            this.api.getExecution(id)
        ]);
        const operationTypeField = customFields.find(
            field => field?.customField?.name === 'operationType'
        );
        return {
            ...test,
            customFields: { operationType: operationTypeField?.name },
            execution
        };
    }

    async resolveTestResult(params: {
        id: number;
        start: number;
        stop: number;
        duration: number;
        status: string;
        message?: string;
        execution?: unknown;
    }) {
        await this.api.resolveTestResult(params);
    }

    async rerunTestResult(params: { id: number; username: string }) {
        return this.api.rerunTestResult(params);
    }

    async getCustomFields(testResultId: number) {
        return this.api.getCustomFields(testResultId);
    }

    async getExecution(testResultId: number) {
        return this.api.getExecution(testResultId);
    }

    async getTestPlans(projectId: number) {
        return this.api.getTestPlans(projectId);
    }

    async runTestPlan(params: { id: number; launchName: string }) {
        return this.api.runTestPlan(params);
    }
}

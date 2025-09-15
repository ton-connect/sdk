import { Injectable } from '@nestjs/common';
import { AllureApi } from '../api';
import { Principal } from '../../auth';
import { USER_ROLE } from '../../users';
import { ForbiddenException } from '../../core/exceptions';
import { NO_WRITE_ACCESS_TO_LAUNCH } from '../errors';

@Injectable()
export class AllureService {
    constructor(private readonly api: AllureApi) {}

    private async assertAccessToLaunch(user: Principal, launchId: number) {
        if (user.role === USER_ROLE.ADMIN) {
            return;
        }

        const launch = await this.api.getLaunchById(launchId);
        const tagName = this.userTag(user);
        const containsTag = launch.tags?.some(tag => tag.name === tagName);
        if (!containsTag) {
            throw new ForbiddenException(NO_WRITE_ACCESS_TO_LAUNCH);
        }
    }

    private async assertAccessToTestResult(user: Principal, testResultId: number) {
        if (user.role === USER_ROLE.ADMIN) {
            return;
        }

        const testResult = await this.api.getTestResult(testResultId);
        await this.assertAccessToLaunch(user, testResult.launchId);
    }

    private userTag(user: Principal) {
        return `wallet::${user.login}`;
    }

    private async getTagIdByUser(user: Principal) {
        return this.api.createOrFindTag(this.userTag(user));
    }

    async getLaunches(
        params: {
            projectId: number;
            search?: string;
            page?: number;
            size?: number;
            sort?: string;
        },
        user?: Principal
    ) {
        const parsedParams = {
            ...params,
            tags:
                user && user.role !== USER_ROLE.ADMIN
                    ? [(await this.getTagIdByUser(user)).id]
                    : undefined
        };
        return this.api.getLaunches(parsedParams);
    }

    async completeLaunch(id: number, user: Principal) {
        await this.assertAccessToLaunch(user, id);
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

    async resolveTestResult(
        params: {
            id: number;
            start: number;
            stop: number;
            duration: number;
            status: string;
            message?: string;
            execution?: unknown;
        },
        user: Principal
    ) {
        await this.assertAccessToTestResult(user, params.id);
        await this.api.resolveTestResult(params);
    }

    async rerunTestResult(params: { id: number; username: string }, user: Principal) {
        await this.assertAccessToTestResult(user, params.id);
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

    async runTestPlan(params: { id: number; launchName: string }, user: Principal) {
        const tags = user.role !== USER_ROLE.ADMIN ? [await this.getTagIdByUser(user)] : undefined;
        return this.api.runTestPlan({
            ...params,
            tags
        });
    }
}

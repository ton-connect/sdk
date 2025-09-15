import { HttpStatus, Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { AppConfig } from '../../core/config/config';

@Injectable()
export class AllureApi {
    private readonly client: AxiosInstance;

    private accessToken?: string;

    private get bearerToken(): string | undefined {
        if (this.accessToken) {
            return `Bearer ${this.accessToken}`;
        }

        return undefined;
    }

    constructor(private readonly config: AppConfig) {
        const baseURL = this.config.getOrThrow('ALLURE_BASE_URL', { infer: true });
        const apiToken = this.config.getOrThrow('ALLURE_API_TOKEN', { infer: true });

        this.client = axios.create({
            baseURL,
            paramsSerializer: params =>
                Object.entries(params)
                    .map(([key, value]) =>
                        Array.isArray(value)
                            ? value.map(v => `${key}=${encodeURIComponent(v)}`).join('&')
                            : `${key}=${encodeURIComponent(value)}`
                    )
                    .join('&')
        });

        this.client.interceptors.request.use(async config => {
            config.headers.Authorization = this.bearerToken;
            return config;
        });

        this.client.interceptors.response.use(
            response => response,
            async error => {
                const status = error?.response?.status;
                if (status === HttpStatus.UNAUTHORIZED) {
                    try {
                        this.accessToken = await this.authenticate(apiToken);
                        error.config.headers.Authorization = this.bearerToken;
                        return await this.client.request(error.config);
                    } catch (authError) {
                        return Promise.reject(authError);
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    async authenticate(userToken: string): Promise<string> {
        const body = new URLSearchParams({
            grant_type: 'apitoken',
            scope: 'openid',
            token: userToken
        });
        const { data } = await this.client.post<{ access_token: string }>(
            `/api/uaa/oauth/token`,
            body,
            {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return data.access_token;
    }

    async getLaunches(params: {
        projectId: number;
        search?: string;
        page?: number;
        size?: number;
        sort?: string;
    }) {
        const { data } = await this.client.get(`/api/launch`, {
            params
        });
        return data;
    }

    async completeLaunch(id: number) {
        const { data } = await this.client.post(`/api/launch/${id}/close`, undefined, {});
        return data;
    }

    async getLaunchItems(params: {
        launchId: number;
        search?: string;
        page?: number;
        size?: number;
        sort?: string;
    }) {
        const { launchId, ...query } = params;
        const { data } = await this.client.get(`/api/v2/launch/${launchId}/test-result/flat`, {
            params: query
        });
        return data;
    }

    async getLaunchItemsTree(params: {
        launchId: number;
        search?: string;
        page?: number;
        size?: number;
        path?: number | number[];
    }) {
        const { launchId, path, ...rest } = params;
        const { data } = await this.client.get(
            `/api/v2/launch/${launchId}/test-result/tree/entity`,
            {
                params: {
                    ...rest,
                    deleted: false,
                    treeId: 70,
                    sort: ['nodeSortOrder,asc', 'name,asc'],
                    path
                }
            }
        );
        return data;
    }

    async getTestResult(id: number) {
        const { data } = await this.client.get(`/api/testresult/${id}`, {});
        return data;
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
        const { data } = await this.client.post(
            `/api/testresult/${params.id}/resolve`,
            {
                start: params.start,
                stop: params.stop,
                duration: params.duration,
                status: params.status,
                message: params.message,
                ...(params.execution ? { execution: params.execution } : {})
            },
            {
                params: { v2: true }
            }
        );
        return data;
    }

    async rerunTestResult(params: { id: number; username: string }) {
        const { data } = await this.client.post(`/api/testresult/${params.id}/rerun`, {
            username: params.username
        });
        return data;
    }

    async getCustomFields(testResultId: number) {
        const { data } = await this.client.get(`/api/testresult/${testResultId}/cfv`);
        return data;
    }

    async getExecution(testResultId: number) {
        const { data } = await this.client.get(`/api/testresult/${testResultId}/execution`, {
            params: { v2: true }
        });
        return data;
    }

    async getTestPlans(projectId: number) {
        const { data } = await this.client.get(`/api/testplan`, {
            params: { projectId }
        });
        return data;
    }

    async runTestPlan(params: { id: number; launchName: string }) {
        const { data } = await this.client.post(`/api/testplan/${params.id}/run`, {
            launchName: params.launchName
        });
        return data;
    }
}

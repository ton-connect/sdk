import type {
    Launch,
    TestCase,
    PaginatedResponse,
    LaunchFilters,
    TestCaseFilters,
    TestResult,
    ResolveTestResultParams,
    RerunTestResultParams,
    CustomField
} from '../models';
import { Base64 } from '@tonconnect/protocol';

export type ApiClientOptions = { jwtToken?: string };

export class AllureApiClient {
    private readonly baseUrl = 'https://tontech.testops.cloud';
    private jwtToken: string;

    constructor(options: ApiClientOptions) {
        this.jwtToken = options.jwtToken ?? '';
    }

    setJwtToken(token: string) {
        this.jwtToken = token;
    }

    private buildUrl(
        path: string,
        query?: Record<string, string | number | boolean | undefined>
    ): URL {
        const url = new URL(path, this.baseUrl);

        if (query) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined) continue;
                url.searchParams.set(key, value.toString());
            }
        }

        return url;
    }

    private buildHeaders(): HeadersInit {
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.jwtToken}`
        };
    }

    async authenticate(userToken: string, signal?: AbortSignal): Promise<string> {
        const form = new URLSearchParams();
        form.set('grant_type', 'apitoken');
        form.set('scope', 'openid');
        form.set('token', userToken);

        const res = await fetch(`${this.baseUrl}/api/uaa/oauth/token`, {
            method: 'POST',
            headers: { Accept: 'application/json' },
            body: form,
            signal
        });

        if (!res.ok) {
            throw new Error(`Authentication failed: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        const access = data?.access_token || '';
        this.setJwtToken(access);
        return access;
    }

    async getLaunches(
        params: LaunchFilters,
        signal?: AbortSignal
    ): Promise<PaginatedResponse<Launch>> {
        const { projectId, search, page = 0, size = 10, sort = 'created_date,DESC' } = params;
        const searchEncoded = search ? this.buildSearch('name', search) : undefined;

        const url = this.buildUrl('/api/launch', {
            search: searchEncoded,
            page,
            size,
            sort,
            projectId
        });

        const res = await fetch(url, { headers: this.buildHeaders(), signal });
        if (!res.ok) {
            throw new Error(`Failed to fetch launches: ${res.status} ${res.statusText}`);
        }

        return res.json();
    }

    private buildSearch(id: string, value: string) {
        return Base64.encode(JSON.stringify([{ id, value, type: 'string' }]));
    }

    async getLaunchItems(
        params: TestCaseFilters,
        signal?: AbortSignal
    ): Promise<PaginatedResponse<TestCase>> {
        const { launchId, search, page = 0, size = 100, sort = 'name,ASC' } = params;
        const searchEncoded = search ? this.buildSearch('content', search) : undefined;

        const url = this.buildUrl(`/api/v2/launch/${launchId}/test-result/flat`, {
            search: searchEncoded,
            page,
            size,
            sort
        });

        const res = await fetch(url, { headers: this.buildHeaders(), signal });
        if (!res.ok) {
            throw new Error(`Failed to fetch launch items: ${res.status} ${res.statusText}`);
        }

        return res.json();
    }

    async getLaunchItemsTree(
        params: TestCaseFilters,
        signal?: AbortSignal
    ): Promise<PaginatedResponse<TestCase>> {
        const { launchId, search, page = 0, size = 100, sort = 'name,ASC', path } = params;
        const searchEncoded = search ? this.buildSearch('content', search) : undefined;

        const url = this.buildUrl(`/api/v2/launch/${launchId}/test-result/tree/entity`, {
            search: searchEncoded,
            page,
            size,
            sort,
            treeId: 70,
            path
        });

        const res = await fetch(url, { headers: this.buildHeaders(), signal });
        if (!res.ok) {
            throw new Error(`Failed to fetch launch items tree: ${res.status} ${res.statusText}`);
        }

        return res.json();
    }

    async getLaunchItemTree(
        launchId: number,
        groupId: number,
        signal?: AbortSignal
    ): Promise<PaginatedResponse<TestCase>> {
        const url = this.buildUrl(`/api/v2/launch/${launchId}/test-result/tree/entity`, {
            treeId: 70,
            path: groupId,
            page: 0,
            size: 100,
            sort: 'name,ASC'
        });

        const res = await fetch(url, { headers: this.buildHeaders(), signal });
        if (!res.ok) {
            throw new Error(`Failed to fetch launch item tree: ${res.status} ${res.statusText}`);
        }

        return res.json();
    }

    async completeLaunch(id: number, signal?: AbortSignal): Promise<void> {
        const res = await fetch(this.buildUrl(`/api/launch/${id}/close`), {
            method: 'POST',
            headers: this.buildHeaders(),
            signal
        });

        if (!res.ok) {
            throw new Error(`Failed to complete launch ${id}: ${res.status} ${res.statusText}`);
        }
    }

    async getTestResult(id: number, signal?: AbortSignal): Promise<TestResult> {
        const res = await fetch(this.buildUrl(`/api/testresult/${id}`), {
            headers: this.buildHeaders(),
            signal
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch test result ${id}: ${res.status} ${res.statusText}`);
        }

        return res.json();
    }

    async resolveTestResult(params: ResolveTestResultParams, signal?: AbortSignal): Promise<void> {
        const url = this.buildUrl(`/api/testresult/${params.id}/resolve`, { v2: true });

        const res = await fetch(url, {
            method: 'POST',
            headers: this.buildHeaders(),
            signal,
            body: JSON.stringify({
                start: params.start,
                stop: params.stop,
                duration: params.duration,
                status: params.status,
                message: params.message
            })
        });

        if (!res.ok) {
            throw new Error(
                `Failed to resolve test result ${params.id}: ${res.status} ${res.statusText}`
            );
        }
    }

    async rerunTestResult(
        params: RerunTestResultParams,
        signal?: AbortSignal
    ): Promise<{ id: number; name: string }> {
        const res = await fetch(this.buildUrl(`/api/testresult/${params.id}/rerun`), {
            method: 'POST',
            headers: this.buildHeaders(),
            body: JSON.stringify({
                username: params.username
            }),
            signal
        });

        if (!res.ok) {
            throw new Error(
                `Failed to rerun test result ${params.id}: ${res.status} ${res.statusText}`
            );
        }

        return res.json();
    }

    async getCustomFields(testResultId: number, signal?: AbortSignal): Promise<CustomField[]> {
        const res = await fetch(this.buildUrl(`/api/testresult/${testResultId}/cfv`), {
            headers: this.buildHeaders(),
            signal
        });

        if (!res.ok) {
            throw new Error(
                `Failed to fetch custom fields for test result ${testResultId}: ${res.status} ${res.statusText}`
            );
        }

        return res.json();
    }
}

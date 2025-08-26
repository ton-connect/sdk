import type { Launch, TestCase, PaginatedResponse, LaunchFilters, TestCaseFilters } from '../types';
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

    private buildUrl(path: string, query?: Record<string, string | number | undefined>): URL {
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

    async authenticate(userToken: string): Promise<string> {
        const form = new URLSearchParams();
        form.set('grant_type', 'apitoken');
        form.set('scope', 'openid');
        form.set('token', userToken);

        const res = await fetch(`${this.baseUrl}/api/uaa/oauth/token`, {
            method: 'POST',
            headers: { Accept: 'application/json' },
            body: form
        });

        if (!res.ok) {
            throw new Error(`Authentication failed: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        const access = data?.access_token || '';
        this.setJwtToken(access);
        return access;
    }

    async getLaunches(params: LaunchFilters): Promise<PaginatedResponse<Launch>> {
        const { projectId, search, page = 0, size = 10, sort = 'created_date,DESC' } = params;
        const searchEncoded = search ? this.buildNameSearch(search) : undefined;

        const url = this.buildUrl('/api/launch', {
            search: searchEncoded,
            page,
            size,
            sort,
            projectId
        });

        const res = await fetch(url, { headers: this.buildHeaders() });
        if (!res.ok) {
            throw new Error(`Failed to fetch launches: ${res.status} ${res.statusText}`);
        }

        return res.json();
    }

    private buildNameSearch(value: string) {
        return Base64.encode(JSON.stringify([{ id: 'name', value, type: 'string' }]));
    }

    async getLaunchItems(params: TestCaseFilters): Promise<PaginatedResponse<TestCase>> {
        const { launchId, search, page = 0, size = 100, sort = 'name,ASC' } = params;
        const searchEncoded = search ? this.buildNameSearch(search) : undefined;

        const url = this.buildUrl(`/api/v2/launch/${launchId}/test-result/flat`, {
            search: searchEncoded,
            page,
            size,
            sort
        });

        const res = await fetch(url, { headers: this.buildHeaders() });
        if (!res.ok) {
            throw new Error(`Failed to fetch launch items: ${res.status} ${res.statusText}`);
        }

        return res.json();
    }

    async completeLaunch(id: number): Promise<void> {
        const res = await fetch(this.buildUrl(`/api/launch/${id}/close`), {
            method: 'POST',
            headers: this.buildHeaders()
        });

        if (!res.ok) {
            throw new Error(`Failed to complete launch ${id}: ${res.status} ${res.statusText}`);
        }
    }

    async getLaunchDetails(id: number): Promise<Launch> {
        const res = await fetch(this.buildUrl(`/api/launch/${id}`), {
            headers: this.buildHeaders()
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch launch details: ${res.status} ${res.statusText}`);
        }

        return res.json();
    }
}

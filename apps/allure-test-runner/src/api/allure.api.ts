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
            throw new Error(`Auth failed: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        const access = data?.access_token || '';
        this.setJwtToken(access);
        return access;
    }

    async getLaunches(params: {
        projectId: number;
        search?: string;
        page?: number;
        size?: number;
        sort?: string;
    }): Promise<any> {
        const { projectId, search = '', page = 0, size = 10, sort = 'created_date,DESC' } = params;
        const url = `${this.baseUrl}/api/launch?projectId=${projectId}&search=${search}&page=${page}&size=${size}&sort=${sort}`;
        const res = await fetch(url, { headers: this.buildHeaders() });
        if (!res.ok) {
            throw new Error(`Failed to fetch launches: ${res.status} ${res.statusText}`);
        }
        return res.json();
    }

    async getLaunchItems(params: {
        launchId: number;
        page?: number;
        size?: number;
        sort?: string;
    }): Promise<any> {
        const { launchId, page = 0, size = 100, sort = 'name,ASC' } = params;
        const url = `${this.baseUrl}/api/v2/launch/${launchId}/test-result/flat?page=${page}&size=${size}&sort=${sort}`;
        const res = await fetch(url, { headers: this.buildHeaders() });
        if (!res.ok) {
            throw new Error(`Failed to fetch launch items: ${res.status} ${res.statusText}`);
        }
        return res.json();
    }

    async completeLaunch(id: number): Promise<void> {
        const url = `${this.baseUrl}/api/launch/${id}/close`;
        const res = await fetch(url, { method: 'POST', headers: this.buildHeaders() });
        if (!res.ok) {
            throw new Error(`Failed to complete launch ${id}: ${res.status} ${res.statusText}`);
        }
    }
}

export type PaginatedResponse<T> = {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    size: number;
    number: number;
    sort: {
        empty: number;
        sorted: number;
        unsorted: number;
    };
    numberOfElements: number;
    first: boolean;
    empty: bigint;
};

export type LaunchFilters = {
    projectId: number;
    search?: string;
    page?: number;
    size?: number;
    sort?: string;
};

export type TestCaseFilters = {
    launchId: number;
    search?: string;
    page?: number;
    size?: number;
    sort?: string;
    path?: number | number[];
};

export type ResolveTestResultParams = {
    id: number;
    start?: number;
    stop?: number;
    duration?: number;
    status: 'passed' | 'failed';
    message?: string;
    execution?: {
        status: 'passed' | 'failed';
        steps?: Array<{
            type: string;
            body?: string;
            showMessage?: boolean;
            steps?: unknown[];
            markup?: string;
            status?: 'passed' | 'failed' | 'skipped';
        }>;
    };
};

export type RerunTestResultParams = {
    id: number;
    username: string;
};

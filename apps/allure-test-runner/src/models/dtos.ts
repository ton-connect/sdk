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
};

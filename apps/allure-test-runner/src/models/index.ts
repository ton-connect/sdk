export type Launch = {
    id: number;
    name: string;
    closed: boolean;
    createdDate: string;
    updatedDate: string;
    status: string;
    description?: string;
};

export type TestCase = {
    id: number;
    name: string;
    status?: string;
    duration: number;
    startTime: string;
    endTime: string;
    description?: string;
    tags?: string[];
    testCaseId?: string;
};

export type PaginatedResponse<T> = {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
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

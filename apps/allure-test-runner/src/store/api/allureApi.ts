import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
    QueryReturnValue,
    FetchBaseQueryError,
    FetchBaseQueryMeta
} from '@reduxjs/toolkit/query';
import { Base64 } from '@tonconnect/protocol';
import type {
    Launch,
    TestCase,
    PaginatedResponse,
    LaunchFilters,
    TestCaseFilters,
    TestResult,
    ResolveTestResultParams,
    RerunTestResultParams,
    CustomField,
    Execution
} from '../../models';
import { CUSTOM_FIELD_NAMES } from '../../models';
import type { RootState } from '../index';
import type { Testplan } from '../../models/allure/Testplan';

const baseUrl = 'https://tontech.testops.cloud';

export const allureApi = createApi({
    reducerPath: 'allureApi',
    baseQuery: fetchBaseQuery({
        baseUrl,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            // Do not set a global Content-Type; let each request define it
            return headers;
        }
    }),
    tagTypes: ['Launch', 'TestCase', 'TestResult'],
    endpoints: builder => ({
        // Authentication
        authenticate: builder.mutation<string, { userToken: string }>({
            query: ({ userToken }) => ({
                url: '/api/uaa/oauth/token',
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    grant_type: 'apitoken',
                    scope: 'openid',
                    token: userToken
                })
            }),
            transformResponse: (response: unknown) =>
                (response as { access_token: string }).access_token
        }),

        // Launches
        getLaunches: builder.query<PaginatedResponse<Launch>, LaunchFilters>({
            query: ({ projectId, search, page = 0, size = 10, sort = 'created_date,DESC' }) => {
                const searchEncoded = search ? buildSearch('name', search) : undefined;
                return {
                    url: '/api/launch',
                    params: {
                        search: searchEncoded,
                        page,
                        size,
                        sort,
                        projectId
                    }
                };
            },
            providesTags: ['Launch']
        }),

        completeLaunch: builder.mutation<void, { id: number }>({
            query: ({ id }) => ({
                url: `/api/launch/${id}/close`,
                method: 'POST'
            }),
            invalidatesTags: ['Launch']
        }),

        // Test Cases
        getLaunchItems: builder.query<PaginatedResponse<TestCase>, TestCaseFilters>({
            query: ({ launchId, search, page = 0, size = 100, sort = 'name,ASC' }) => {
                const searchEncoded = search ? buildSearch('content', search) : undefined;
                return {
                    url: `/api/v2/launch/${launchId}/test-result/flat`,
                    params: {
                        search: searchEncoded,
                        page,
                        size,
                        sort
                    }
                };
            },
            providesTags: ['TestCase']
        }),

        getLaunchItemsTree: builder.query<PaginatedResponse<TestCase>, TestCaseFilters>({
            query: ({ launchId, search, page = 0, size = 100, path }) => {
                const searchEncoded = search ? buildSearch('content', search) : undefined;
                const qs = new URLSearchParams();
                if (searchEncoded) qs.set('search', searchEncoded);
                qs.set('page', String(page));
                qs.set('size', String(size));
                qs.append('sort', 'nodeSortOrder,asc');
                qs.append('sort', 'name,asc');
                qs.set('deleted', String(false));
                qs.set('treeId', String(70));
                if (Array.isArray(path)) {
                    // Append multiple path values
                    for (const p of path) qs.append('path', String(p));
                } else if (typeof path !== 'undefined') {
                    qs.set('path', String(path));
                }
                return {
                    url: `/api/v2/launch/${launchId}/test-result/tree/entity?${qs.toString()}`
                };
            },
            providesTags: ['TestCase']
        }),

        getLaunchItemTree: builder.query<
            PaginatedResponse<TestCase>,
            { launchId: number; path: number | number[] }
        >({
            query: ({ launchId, path }) => {
                const qs = new URLSearchParams();
                qs.set('treeId', String(70));
                if (Array.isArray(path)) {
                    for (const p of path) qs.append('path', String(p));
                } else {
                    qs.set('path', String(path));
                }
                qs.set('page', String(0));
                qs.set('size', String(100));
                qs.append('sort', 'nodeSortOrder,asc');
                qs.append('sort', 'name,asc');
                qs.set('deleted', String(false));
                return {
                    url: `/api/v2/launch/${launchId}/test-result/tree/entity?${qs.toString()}`
                };
            },
            providesTags: ['TestCase']
        }),

        // Test Results
        getTestResult: builder.query<TestResult, { id: number }>({
            query: ({ id }) => `/api/testresult/${id}`,
            providesTags: (_result, _error, { id }) => [{ type: 'TestResult', id }]
        }),

        // Composite query similar to AllureService.getWithCustomFields
        getTestResultWithCustomFields: builder.query<
            TestResult & { customFields: { operationType?: string }; execution?: Execution },
            { id: number }
        >({
            async queryFn(
                arg,
                _api,
                _extraOptions,
                baseQuery
            ): Promise<
                QueryReturnValue<
                    TestResult & {
                        customFields: { operationType?: string };
                        execution?: Execution;
                    },
                    FetchBaseQueryError,
                    FetchBaseQueryMeta
                >
            > {
                const { id } = arg;
                const [resTest, resCF, resExec] = await Promise.all([
                    baseQuery({ url: `/api/testresult/${id}` }),
                    baseQuery({ url: `/api/testresult/${id}/cfv` }),
                    baseQuery({ url: `/api/testresult/${id}/execution?v2=true` })
                ]);

                if (resTest.error) return { error: resTest.error };
                if (resCF.error) return { error: resCF.error };
                if (resExec.error) return { error: resExec.error };

                const test = resTest.data as TestResult;
                const customFields = resCF.data as CustomField[];
                const execution = resExec.data as Execution;

                const operationTypeField = customFields.find(
                    cf => cf.customField.name === CUSTOM_FIELD_NAMES.OPERATION_TYPE
                );

                return {
                    data: {
                        ...test,
                        customFields: {
                            operationType: operationTypeField?.name
                        },
                        execution
                    }
                };
            },
            providesTags: (_result, _error, { id }) => [{ type: 'TestResult', id }]
        }),

        resolveTestResult: builder.mutation<void, ResolveTestResultParams>({
            query: params => ({
                url: `/api/testresult/${params.id}/resolve`,
                method: 'POST',
                params: { v2: true },
                body: {
                    start: params.start,
                    stop: params.stop,
                    duration: params.duration,
                    status: params.status,
                    message: params.message,
                    ...(params.execution && { execution: params.execution })
                }
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'TestResult', id },
                'TestCase',
                'Launch'
            ]
        }),

        rerunTestResult: builder.mutation<{ id: number; name: string }, RerunTestResultParams>({
            query: params => ({
                url: `/api/testresult/${params.id}/rerun`,
                method: 'POST',
                body: {
                    username: params.username
                }
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'TestResult', id },
                'TestCase',
                'Launch'
            ]
        }),

        getCustomFields: builder.query<CustomField[], { testResultId: number }>({
            query: ({ testResultId }) => `/api/testresult/${testResultId}/cfv`
        }),

        getExecution: builder.query<Execution, { testResultId: number }>({
            query: ({ testResultId }) => `/api/testresult/${testResultId}/execution?v2=true`
        }),
        // Testplans
        getTestplans: builder.query<{ content: Testplan[] }, { projectId: number }>({
            query: ({ projectId }) => `/api/testplan?projectId=${projectId}`
        }),

        runTestplan: builder.mutation<{ id: number }, { id: number; launchName: string }>({
            query: ({ id, launchName }) => ({
                url: `/api/testplan/${id}/run`,
                method: 'POST',
                body: {
                    launchName
                }
            }),
            invalidatesTags: ['Launch']
        })
    })
});

// Helper function for building search queries
function buildSearch(id: string, value: string): string {
    return Base64.encode(JSON.stringify([{ id, value, type: 'string' }]));
}

export const {
    useAuthenticateMutation,
    useGetLaunchesQuery,
    useCompleteLaunchMutation,
    useGetLaunchItemsQuery,
    useGetLaunchItemsTreeQuery,
    useGetLaunchItemTreeQuery,
    useGetTestResultQuery,
    useResolveTestResultMutation,
    useRerunTestResultMutation,
    useGetCustomFieldsQuery,
    useGetExecutionQuery,
    useGetTestResultWithCustomFieldsQuery,
    useLazyGetLaunchItemTreeQuery,
    useGetTestplansQuery,
    useRunTestplanMutation
} = allureApi;

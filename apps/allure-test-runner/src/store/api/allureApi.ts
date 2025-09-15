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
import type { Testplan } from '../../models/allure/Testplan';

const baseUrl = 'http://localhost:4444/api/v1';

export const allureApi = createApi({
    reducerPath: 'allureApi',
    baseQuery: fetchBaseQuery({
        baseUrl,
        prepareHeaders: headers => {
            headers.set('Content-Type', 'application/json');

            const token = localStorage.getItem('token');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }

            return headers;
        }
    }),
    tagTypes: ['Launch', 'TestCase', 'TestResult'],
    endpoints: builder => ({
        // Auth
        signUp: builder.mutation<void, { login: string; password: string }>({
            query: credentials => ({
                url: '/auth/sign-up',
                method: 'POST',
                body: credentials
            })
        }),
        signIn: builder.mutation<{ accessToken: string }, { login: string; password: string }>({
            query: credentials => ({
                url: '/auth/sign-in',
                method: 'POST',
                body: credentials
            })
        }),
        getMe: builder.query<{ id: number; login: string; role: string }, void>({
            query: () => '/auth/me'
        }),

        // Admin - Users Management
        getUsers: builder.query<
            {
                total: number;
                items: {
                    id: number;
                    login: string;
                    role: string;
                    walletName: string | null;
                    createdAt: string;
                }[];
            },
            { search?: string; limit?: number; offset?: number; sort?: string[] } | void
        >({
            query: args => ({
                url: '/users',
                params: args ?? {}
            })
        }),
        updateUser: builder.mutation<
            {
                id: number;
                login: string;
                role: string;
                walletName: string | null;
                createdAt: string;
            },
            { id: number; role?: string; walletName?: string }
        >({
            query: ({ id, ...body }) => ({
                url: `/users/${id}`,
                method: 'PATCH',
                body
            })
        }),

        // Launches
        getLaunches: builder.query<PaginatedResponse<Launch>, LaunchFilters>({
            query: ({ projectId, search, page = 0, size = 10, sort = 'created_date,DESC' }) => {
                return {
                    url: '/allure/launches',
                    params: {
                        search,
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
                url: `/allure/launches/${id}/close`,
                method: 'POST'
            }),
            invalidatesTags: ['Launch']
        }),

        // Test Cases
        getLaunchItems: builder.query<PaginatedResponse<TestCase>, TestCaseFilters>({
            query: ({ launchId, search, page = 0, size = 250, sort = 'name,ASC' }) => {
                const searchEncoded = search ? buildSearch('content', search) : undefined;
                return {
                    url: `/allure/launches/${launchId}/items`,
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
                qs.set('treeId', String(70));
                if (Array.isArray(path)) {
                    // Append multiple path values
                    for (const p of path) qs.append('path', String(p));
                } else if (typeof path !== 'undefined') {
                    qs.set('path', String(path));
                }
                return {
                    url: `/allure/launches/${launchId}/items-tree?${qs.toString()}`
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
                return {
                    url: `/allure/launches/${launchId}/items-tree?${qs.toString()}`
                };
            },
            providesTags: ['TestCase']
        }),

        // Test Results
        getTestResult: builder.query<TestResult, { id: number }>({
            query: ({ id }) => `/allure/testresult/${id}`,
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
                    baseQuery({ url: `/allure/testresult/${id}` }),
                    baseQuery({ url: `/allure/testresult/${id}/cfv` }),
                    baseQuery({ url: `/allure/testresult/${id}/execution?v2=true` })
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
                url: `/allure/testresult/${params.id}/resolve`,
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
                url: `/allure/testresult/${params.id}/rerun`,
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
            query: ({ testResultId }) => `/allure/testresult/${testResultId}/cfv`
        }),

        getExecution: builder.query<Execution, { testResultId: number }>({
            query: ({ testResultId }) => `/allure/testresult/${testResultId}/execution?v2=true`
        }),
        // Testplans
        getTestplans: builder.query<{ content: Testplan[] }, { projectId: number }>({
            query: ({ projectId }) => `/allure/testplan?projectId=${projectId}`
        }),

        runTestplan: builder.mutation<{ id: number }, { id: number; launchName: string }>({
            query: ({ id, launchName }) => ({
                url: `/allure/testplan/${id}/run`,
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
    useSignUpMutation,
    useSignInMutation,
    useGetMeQuery,
    useGetUsersQuery,
    useUpdateUserMutation,
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

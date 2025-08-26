export type TestCase = {
    type: string;
    id: number;
    name: string;
    testCaseId: number;
    flaky: boolean;
    hidden: boolean;
    manual: boolean;
    createdDate: number;
    lastModifiedDate: number;
    status?: 'unknown' | 'passed' | 'failed';
};

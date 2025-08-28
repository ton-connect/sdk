export type TestCaseStatistic = {
    failed: number;
    broken: number;
    passed: number;
    skipped: number;
    unknown: number;
    inProgress: number;
    total: number;
};

export type TestCaseGroup = {
    type: 'GROUP';
    id: number;
    name: string;
    customFieldId: number;
    statistic: TestCaseStatistic;
};

export type TestCaseItem = {
    type: 'TEST_CASE';
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

export type TestCase = TestCaseGroup | TestCaseItem;

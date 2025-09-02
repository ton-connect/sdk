export type ExecutionStep = {
    type: string;
    body?: string;
    bodyJson?: unknown;
    showMessage?: boolean;
    status?: 'passed' | 'failed' | 'skipped';
};

export type Execution = {
    steps?: ExecutionStep[];
};

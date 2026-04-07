export function parseRequestParams(params: unknown[]): unknown {
    const param = params[0];
    return typeof param === 'string' ? JSON.parse(param) : param;
}

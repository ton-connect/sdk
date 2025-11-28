export async function waitForSome<T>(
    promises: Promise<T>[],
    count: number
): Promise<PromiseSettledResult<T>[]> {
    if (count <= 0) return [];
    if (count > promises.length) {
        throw new RangeError('count cannot be greater than the number of promises');
    }

    return new Promise(resolve => {
        const results: PromiseSettledResult<T>[] = [];
        let settledCount = 0;

        for (const p of promises) {
            Promise.resolve(p)
                .then(value => ({ status: 'fulfilled' as const, value }))
                .catch(reason => ({ status: 'rejected' as const, reason }))
                .then(result => {
                    results.push(result);
                    settledCount++;
                    if (settledCount === count) {
                        resolve(results);
                    }
                });
        }
    });
}

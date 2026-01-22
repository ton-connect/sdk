export async function waitForSome<T>(
    promises: Promise<T>[],
    count: number
): Promise<PromiseSettledResult<T>[]> {
    if (count <= 0) return [];
    if (count > promises.length) {
        throw new RangeError('count cannot be greater than the number of promises');
    }

    const results: PromiseSettledResult<T>[] = new Array(promises.length);
    let settledCount = 0;

    return new Promise(resolve => {
        promises.forEach((p, index) => {
            Promise.resolve(p)
                .then(value => ({ status: 'fulfilled' as const, value }))
                .catch(reason => ({ status: 'rejected' as const, reason }))
                .then(result => {
                    results[index] = result;
                    settledCount++;
                    if (settledCount === count) {
                        resolve(results);
                    }
                });
        });
    });
}

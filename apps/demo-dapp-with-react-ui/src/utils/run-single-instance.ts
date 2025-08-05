/**
 * An asynchronous task.
 */
type AsyncTask = () => Promise<void>;

/**
 * A function that runs an asynchronous task.
 */
type RunAsyncTask = () => Promise<void>;

/**
 * Runs a single instance of an asynchronous task without overlapping.
 *
 * @param asyncTask - The asynchronous task to be executed.
 * @return - A function that, when called, runs the asyncTask if it is not already running.
 */
export function runSingleInstance(asyncTask: AsyncTask): RunAsyncTask {
  let isTaskRunning = false;
  return async () => {
    if (isTaskRunning) {
      return;
    }

    isTaskRunning = true;
    try {
      await asyncTask();
    } catch (e) {
      console.error(e);
    } finally {
      isTaskRunning = false;
    }
  };
}

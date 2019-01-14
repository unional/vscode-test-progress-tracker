/**
 * Wires in Jest as the test runner in place of the default Mocha.
 */
import { ResultsObject, runCLI, TestRunnerCallback } from 'jest';
import path from 'path';
import sourceMapSupport from 'source-map-support';
import { forwardStdoutStderrStreams } from '../forwardStdoutStderrStreams';
import { jestConfig } from '../jest-test-runner';

export async function run(testRoot: string, callback: TestRunnerCallback) {
  // Enable source map support. This is done in the original Mocha test runner,
  // so do it here. It is not clear if this is having any effect.
  sourceMapSupport.install();

  // Forward logging from Jest to the Debug Console.
  forwardStdoutStderrStreams();

  try {
    const { globalConfig, results } = await runCLI(jestConfig, [path.resolve(testRoot, '../..')])
    const failures = collectTestFailureMessages(results);
    if (failures.length > 0) {
      console.info('globalConfig:', globalConfig);
      callback(null, failures);
    }
    else
      callback(null);
  }
  catch (e) {
    callback(e);
  }
}

/**
 * Collect failure messages from Jest test results.
 *
 * @param results Jest test results.
 */
function collectTestFailureMessages(results: ResultsObject): string[] {
  const failures = results.testResults.reduce<string[]>((acc, testResult) => {
    if (testResult.failureMessage) acc.push(testResult.failureMessage);
    return acc;
  }, []);

  return failures;
}

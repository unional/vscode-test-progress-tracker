/**
 * Wires in Jest as the test runner in place of the default Mocha.
 */
import { runCLI, TestRunnerCallback } from 'jest';
import path from 'path';
import sourceMapSupport from 'source-map-support';
import { forwardStdoutStderrStreams } from '../forwardStdoutStderrStreams';
import { jestConfig } from '../jest-test-runner';


let running = runCLI({ ...jestConfig, watch: true }, [path.resolve(__dirname, '../..')])

export async function run(_testRoot: string, callback: TestRunnerCallback) {
  // Enable source map support. This is done in the original Mocha test runner,
  // so do it here. It is not clear if this is having any effect.
  sourceMapSupport.install();

  // Forward logging from Jest to the Debug Console.
  forwardStdoutStderrStreams();

  try {
    await running
  }
  catch (e) {
    callback(e);
  }
}

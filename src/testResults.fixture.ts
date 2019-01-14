import { TestResults } from 'test-progress-tracker';

export const singleTestAllPass: TestResults = {
  duration: 10,
  startTime: 10,
  numFailedTests: 0,
  numFailedTestSuites: 0,
  numPassedTests: 1,
  numPassedTestSuites: 1,
  numTotalTests: 1,
  numTotalTestSuites: 1
}

export const hundredTestsAllPass: TestResults = {
  duration: 10,
  startTime: 10,
  numFailedTests: 0,
  numFailedTestSuites: 0,
  numPassedTests: 100,
  numPassedTestSuites: 1,
  numTotalTests: 100,
  numTotalTestSuites: 1
}

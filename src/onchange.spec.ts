import a from 'assertron';
import { init, TestResults } from 'test-progress-tracker';
import { onchange } from './onchange';

test('notified with initial results', async () => {
  const rootDir = 'fixtures/with-results'
  let sub
  try {
    init({ rootDir })
    let actual = await new Promise(a => {
      sub = onchange({ showErrorMessage: () => { return } }, rootDir, testResults => a(testResults))
    })

    a.satisfies(actual, singleTest)
  }
  finally {
    if (sub) sub.close()
  }
})


const singleTest: Partial<TestResults> = {
  duration: 10,
  numFailedTests: 0,
  numFailedTestSuites: 0,
  numPassedTests: 1,
  numPassedTestSuites: 1,
  numTotalTests: 1,
  numTotalTestSuites: 1
}

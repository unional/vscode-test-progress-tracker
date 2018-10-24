import { init, TestResults } from '@unional/test-progress-tracker';
import a from 'assertron'
import { onchange } from './onchange';

test('notified with initial results', async () => {
  const rootDir = 'fixtures/with-results'
  let sub
  try {
    init({ rootDir })
    let actual = await new Promise(a => {
      sub = onchange({ rootDir, showErrorMessage: () => { return } }, testResults => a(testResults))
    })

    a.satisfy(actual, singleTest)
  }
  finally {
    sub.close()
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

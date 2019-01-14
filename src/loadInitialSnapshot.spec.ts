import t from 'assert';
import a from 'assertron';
import { loadInitialSnapshot } from './loadInitialSnapshot';

test('folder without .progress will return undefined', async () => {
  const actual = await loadInitialSnapshot(getRootDir('no-result'))
  t.strictEqual(actual, undefined)
})

test('get last entry as latest', async () => {
  const actual = await loadInitialSnapshot(getRootDir('latest'))
  a.satisfies(actual, {
    latest: {
      duration: 8828,
      numFailedTests: 0,
      numFailedTestSuites: 0,
      numPassedTests: 0,
      numPassedTestSuites: 0,
      numTotalTests: 1,
      numTotalTestSuites: 1,
      startTime: 1540344640427
    }
  })
})

test('folder with only filtered result', async () => {
  const actual = await loadInitialSnapshot(getRootDir('filter-only'))
  a.satisfies(actual, {
    full: e => e === undefined
  })
})

test('folder with no coverage result', async () => {
  const actual = await loadInitialSnapshot(getRootDir('no-coverage'))
  a.satisfies(actual, {
    coverage: e => e === undefined
  })
})

function getRootDir(name: string) {
  return `fixtures/loadInitSnapshot/${name}`
}

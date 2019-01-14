import t from 'assert';
import { PassStats } from './PassStats';
import { hundredTestsAllPass } from './testResults.fixture';

test('all tests passes', () => {
  const target = new PassStats(undefined, hundredTestsAllPass, undefined)
  t.strictEqual(target.label, '[-------------------|] 100/100 passed')
})

import t from 'assert';
import { PassStats } from './PassStats';
import { hundredTestsAllPass } from './testResults.fixture';

test('tests passes but no full test history', () => {
  const target = new PassStats(undefined, hundredTestsAllPass, undefined)
  t.strictEqual(target.label, '[---------------|] 100 ---/--- passed')
})

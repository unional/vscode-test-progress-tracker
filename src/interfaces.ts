import { TestResults } from 'test-progress-tracker';

export interface WorkspaceFolderTestSnapshot {
  latest: TestResults,
  last?: TestResults,
  full?: TestResults,
  coverage?: TestResults
}

import path from 'path';
import { progressBar } from 'progress-str';
import { TestResults } from 'test-progress-tracker';
import { TreeItem } from 'vscode';
import { getEmotion } from './getEmotion';

export class BranchCoverageStats extends TreeItem {
  constructor(
    public readonly covered: TestResults | undefined,
    public readonly latest: TestResults,
    public readonly last: TestResults | undefined,
  ) {
    super(`no branch coverage info available`);
    if (covered && covered.coverage) {
      const bar = progressBar({ value: { max: covered.coverage.branches.total || 0 } })
      this.label = `${bar.render(covered.coverage.branches.covered)} branch${covered !== latest ? ' (outdated)' : ''} `

      const emotion = getEmotion(covered.coverage.branches.covered / covered.coverage.branches.total, covered === latest && last && last.coverage ?
        last.coverage.branches.covered / last.coverage.branches.total : undefined)
      this.iconPath = {
        light: path.join(__filename, `../../resources/light/${emotion}.svg`),
        dark: path.join(__filename, `../../resources/dark/${emotion}.svg`)
      }
    }
  }

  get tooltip(): string {
    return this.covered !== this.latest ? 'latest test run has no coverage info, enable coverage to see lastest coverage report' : ''
  }
}

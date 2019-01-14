import path from 'path';
import { progressBar } from 'progress-str';
import { TestResults } from 'test-progress-tracker';
import { TreeItem, TreeItemCollapsibleState } from 'vscode';
import { getEmotion } from './getEmotion';

export class StatementCoverageStats extends TreeItem {
  constructor(
    public readonly covered: TestResults | undefined,
    public readonly latest: TestResults,
    public readonly last: TestResults | undefined,
  ) {
    super(`no statement coverage info available`, TreeItemCollapsibleState.None);
    if (covered && covered.coverage) {
      const bar = progressBar({ value: { max: covered.coverage.statements.total || 0 } })
      this.label = `${bar.render(covered.coverage.statements.covered)} statement${covered !== latest ? ' (outdated)' : ''} `

      const emotion = getEmotion(covered.coverage.statements.covered / covered.coverage.statements.total, covered === latest && last && last.coverage ?
        last.coverage.statements.covered / last.coverage.statements.total : undefined)
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

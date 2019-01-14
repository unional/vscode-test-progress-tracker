import path from 'path';
import { progressBar } from 'progress-str';
import { TestResults } from 'test-progress-tracker';
import { TreeItem } from 'vscode';
import { getEmotion } from './getEmotion';

export class FunctionCoverageStats extends TreeItem {
  constructor(
    public readonly covered: TestResults | undefined,
    public readonly latest: TestResults,
    public readonly last: TestResults | undefined,
  ) {
    super(`no function coverage info available`);
    if (covered && covered.coverage) {
      const bar = progressBar({ value: { max: covered.coverage.functions.total || 0 } })
      this.label = `${bar.render(covered.coverage.functions.covered)} function${covered !== latest ? ' (outdated)' : ''} `

      const emotion = getEmotion(covered.coverage.functions.covered / covered.coverage.functions.total, covered === latest && last && last.coverage ?
        last.coverage.functions.covered / last.coverage.functions.total : undefined)
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

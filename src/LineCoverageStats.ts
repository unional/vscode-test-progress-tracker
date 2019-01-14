import path from 'path';
import { progressBar } from 'progress-str';
import { TestResults } from 'test-progress-tracker';
import { TreeItem } from 'vscode';
import { getEmotion } from './getEmotion';

export class LineCoverageStats extends TreeItem {
  constructor(
    public readonly covered: TestResults | undefined,
    public readonly latest: TestResults,
    public readonly last: TestResults | undefined,
  ) {
    super(`no line coverage info available`);
    if (covered && covered.coverage) {
      const bar = progressBar({ value: { max: covered.coverage.lines.total || 0 } })
      this.label = `${bar.render(covered.coverage.lines.covered)} line${covered !== latest ? ' (outdated)' : ''} `

      const emotion = getEmotion(covered.coverage.lines.covered / covered.coverage.lines.total, covered === latest && last && last.coverage ?
        last.coverage.lines.covered / last.coverage.lines.total : undefined)
      this.iconPath = {
        light: path.join(__filename, `../../resources/light/${emotion}.svg`),
        dark: path.join(__filename, `../../resources/dark/${emotion}.svg`)
      }
    }
  }

  get tooltip(): string {
    // return path.join(__filename, '../resources/light/down-arrow.svg')
    return this.covered !== this.latest ? 'latest test run has no coverage info, enable coverage to see lastest coverage report' : ''
  }
}

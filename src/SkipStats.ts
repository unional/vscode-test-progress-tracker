import path from 'path';
import { progressBar } from 'progress-str';
import { TestResults } from 'test-progress-tracker';
import { TreeItem } from 'vscode';
import { getEmotion } from './getEmotion';

export class SkipStats extends TreeItem {
  constructor(
    public readonly full: TestResults | undefined,
    public readonly latest: TestResults,
    public readonly last: TestResults | undefined,
  ) {
    super(`no skip data available`);
    const bar = progressBar({ value: { max: latest.numTotalTests } })
    const numSkippedTests = latest.numTotalTests - latest.numPassedTests - latest.numFailedTests
    this.label = `${bar.render(numSkippedTests)} skipped${full !== latest && latest.filtered ? ' (filtered)' : ''}`

    const emotion = getEmotion(
      1 - ((numSkippedTests) / latest.numTotalTests),
      last && !last.filtered && !latest.filtered ?
        1 - ((last.numTotalTests - last.numPassedTests - last.numFailedTests) / last.numTotalTests) : undefined)
    this.iconPath = {
      light: path.join(__filename, `../../resources/light/${emotion}.svg`),
      dark: path.join(__filename, `../../resources/dark/${emotion}.svg`)
    }
  }

  get tooltip(): string {
    return this.full !== this.latest ? 'latest test run is filtered, remove filter to see updated full report' : ''
  }
}

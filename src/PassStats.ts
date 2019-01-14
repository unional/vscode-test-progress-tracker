import path from 'path';
import { progressBar } from 'progress-str';
import { TestResults } from 'test-progress-tracker';
import { TreeItem } from 'vscode';
import { getEmotion } from './getEmotion';

export class PassStats extends TreeItem {
  constructor(
    public readonly full: TestResults | undefined,
    public readonly latest: TestResults,
    public readonly last: TestResults | undefined,
  ) {
    super(`no pass data available`);
    const bar = progressBar({ value: [{ max: latest.numTotalTests, textStyle: 'number' }, { max: full && full.numTotalTests, textStyle: 'ratio' }] })
    this.label = `${bar.render(getNumPassed(latest), getNumPassed(full))} passed${full !== latest && latest.filtered ? ' (filtered)' : ''}`

    const emotion = getEmotion(
      1 - (latest.numFailedTests / latest.numTotalTests),
      last && !last.filtered && !latest.filtered ? 1 - (last.numFailedTests / last.numTotalTests) : undefined)
    this.iconPath = {
      light: path.join(__filename, `../../resources/light/${emotion}.svg`),
      dark: path.join(__filename, `../../resources/dark/${emotion}.svg`)
    }
  }

  get tooltip(): string {
    return this.full !== this.latest ? 'latest test run is filtered, remove filter to see updated full report' : ''
  }
}

function getNumPassed(result: TestResults | undefined) {
  return result ? result.numTotalTests - result.numFailedTests : undefined
}

import { TestResults } from '@unional/test-progress-tracker';
import path from 'path';
import { Event, EventEmitter, ProviderResult, TreeDataProvider, TreeItem, TreeItemCollapsibleState, window, workspace } from 'vscode';
import { onchange } from './onchange';

export class TreeViewProgress implements TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData: EventEmitter<TreeItem | undefined> = new EventEmitter<TreeItem | undefined>();
  readonly onDidChangeTreeData: Event<TreeItem | undefined> = this._onDidChangeTreeData.event;
  private latestResults: TestResults
  private lastCoverageResults: TestResults | undefined
  private lastFullResults: TestResults | undefined
  private lastResults: TestResults | undefined
  constructor() {
    // TODO: get active file and use `workspace.getWorkspaceFolder(uri)` to get the active folder, and monitor it.
    // Close the last subscription too.
    if (workspace.workspaceFolders && workspace.workspaceFolders[0])
      onchange({ rootDir: workspace.workspaceFolders[0].uri.fsPath, showErrorMessage: window.showErrorMessage }, testResults => {
        this.lastResults = this.latestResults
        this.latestResults = testResults
        if (testResults.coverage) {
          this.lastCoverageResults = testResults
        }
        if (!testResults.filtered) {
          this.lastFullResults = testResults
        }
        this._onDidChangeTreeData.fire()
      })
  }

  getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
    return element
  }
  getChildren(element?: TreeItem | undefined): ProviderResult<TreeItem[]> {
    if (element) {
      return Promise.resolve([])
    }

    if (!this.latestResults) {
      return Promise.resolve([
        new NoStats()
      ])
    }

    return Promise.resolve([
      new PassStats(this.lastFullResults, this.latestResults, this.lastResults),
      new SkipStats(this.lastFullResults, this.latestResults, this.lastResults),
      new StatementCoverageStats(this.lastCoverageResults, this.latestResults, this.lastResults),
      new BranchCoverageStats(this.lastCoverageResults, this.latestResults, this.lastResults),
      new FunctionCoverageStats(this.lastCoverageResults, this.latestResults, this.lastResults),
      new LineCoverageStats(this.lastCoverageResults, this.latestResults, this.lastResults),
    ])
  }
}

function getEmotion(pct: number, lastPct: number | undefined) {
  if (lastPct === undefined || pct === lastPct) {
    return pct === 1 ?
      'great' :
      pct >= .98 ?
        'good' :
        pct >= 80 ?
          'meh' :
          'bad'
  }
  return pct > lastPct ? 'up' : 'down'
}

class PassStats extends TreeItem {
  constructor(
    public readonly full: TestResults | undefined,
    public readonly latest: TestResults,
    public readonly last: TestResults | undefined,
  ) {
    super(`pass`);
    const result = full || latest

    this.label = `${getBar(result.numPassedTests / result.numTotalTests)} passed${full !== latest ? '*' : ''}`

    const emotion = getEmotion(latest.numPassedTests / latest.numTotalTests, last ? last.numPassedTests / last.numTotalTests : undefined)
    this.iconPath = {
      light: path.join(__filename, `../../resources/light/${emotion}.svg`),
      dark: path.join(__filename, `../../resources/dark/${emotion}.svg`)
    }
  }

  get tooltip(): string {
    return this.full !== this.latest ? 'latest test run is filtered, remove filter to see updated full report' : ''
  }
}

class SkipStats extends TreeItem {
  constructor(
    public readonly full: TestResults | undefined,
    public readonly latest: TestResults,
    public readonly last: TestResults | undefined,
  ) {
    super(`skip`, TreeItemCollapsibleState.None);
    const result = full || latest

    this.label = `${getBar(result.numTotalTests - result.numPassedTests - result.numFailedTests / result.numTotalTests)} skipped${full !== latest ? '*' : ''}`

    const emotion = getEmotion(1 - (latest.numTotalTests - latest.numPassedTests - latest.numFailedTests / latest.numTotalTests), last ?
      1 - (last.numTotalTests - last.numPassedTests - last.numFailedTests / last.numTotalTests) : undefined)
    this.iconPath = {
      light: path.join(__filename, `../../resources/light/${emotion}.svg`),
      dark: path.join(__filename, `../../resources/dark/${emotion}.svg`)
    }
  }

  get tooltip(): string {
    return this.full !== this.latest ? 'latest test run is filtered, remove filter to see updated full report' : ''
  }
}

class NoStats extends TreeItem {
  constructor() {
    super(`no progress data`, TreeItemCollapsibleState.None);
  }
}

class BranchCoverageStats extends TreeItem {
  constructor(
    public readonly covered: TestResults | undefined,
    public readonly latest: TestResults,
    public readonly last: TestResults | undefined,
  ) {
    super(`no branch coverage info`, TreeItemCollapsibleState.None);
    if (covered && covered.coverage) {
      this.label = `${getBar(covered.coverage.branches.covered / covered.coverage.branches.total || 0)} branch${covered !== latest ? '*' : ''} `

      const emotion = getEmotion(covered.coverage.branches.covered / covered.coverage.branches.total, last && last.coverage ?
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

class FunctionCoverageStats extends TreeItem {
  constructor(
    public readonly covered: TestResults | undefined,
    public readonly latest: TestResults,
    public readonly last: TestResults | undefined,
  ) {
    super(`no function coverage info`, TreeItemCollapsibleState.None);
    if (covered && covered.coverage) {
      this.label = `${getBar(covered.coverage.functions.covered / covered.coverage.functions.total || 0)} function${covered !== latest ? '*' : ''} `

      const emotion = getEmotion(covered.coverage.functions.covered / covered.coverage.functions.total, last && last.coverage ?
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

class LineCoverageStats extends TreeItem {
  constructor(
    public readonly covered: TestResults | undefined,
    public readonly latest: TestResults,
    public readonly last: TestResults | undefined,
  ) {
    super(`no line coverage info`, TreeItemCollapsibleState.None);
    if (covered && covered.coverage) {
      this.label = `${getBar(covered.coverage.lines.covered / covered.coverage.lines.total || 0)} line${covered !== latest ? '*' : ''} `

      const emotion = getEmotion(covered.coverage.lines.covered / covered.coverage.lines.total, last && last.coverage ?
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

class StatementCoverageStats extends TreeItem {
  constructor(
    public readonly covered: TestResults | undefined,
    public readonly latest: TestResults,
    public readonly last: TestResults | undefined,
  ) {
    super(`no statement coverage info`, TreeItemCollapsibleState.None);
    if (covered && covered.coverage) {
      this.label = `${getBar(covered.coverage.statements.covered / covered.coverage.statements.total || 0)} statement${covered !== latest ? '*' : ''} `

      const emotion = getEmotion(covered.coverage.statements.covered / covered.coverage.statements.total, last && last.coverage ?
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

function getBar(percentage: number) {
  const bar = `-----------------------------`
  const index = Math.floor(percentage * bar.length)

  return `[${bar.substr(0, index) + '|' + bar.substr(index === 0 ? 0 : index + 1)}] ${(percentage * 100).toFixed(1)}% `
}

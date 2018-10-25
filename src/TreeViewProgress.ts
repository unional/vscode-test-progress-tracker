import path from 'path';
import { TestResults } from 'test-progress-tracker';
import { Event, EventEmitter, ProviderResult, TreeDataProvider, TreeItem, TreeItemCollapsibleState, window, workspace } from 'vscode';
import { onchange } from './onchange';

interface WorkspaceFolderTestResults {
  latest: TestResults,
  last?: TestResults,
  full?: TestResults,
  coverage?: TestResults
}

export class TreeViewProgress implements TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData: EventEmitter<TreeItem | undefined> = new EventEmitter<TreeItem | undefined>();
  readonly onDidChangeTreeData: Event<TreeItem | undefined> = this._onDidChangeTreeData.event;
  private workspaceFolders: { [k: string]: WorkspaceFolderTestResults } = {}
  constructor() {
    if (workspace.workspaceFolders) {
      workspace.workspaceFolders.forEach(folder => {
        const rootDir = folder.uri.fsPath
        onchange({ showErrorMessage: window.showErrorMessage }, rootDir, testResults => {
          this.workspaceFolders[rootDir] = {
            latest: testResults,
            last: this.workspaceFolders[rootDir] && this.workspaceFolders[rootDir].latest,
            full: !testResults.filtered ? testResults : this.workspaceFolders[rootDir] && this.workspaceFolders[rootDir].full,
            coverage: testResults.coverage ? testResults : this.workspaceFolders[rootDir] && this.workspaceFolders[rootDir].coverage
          }

          this._onDidChangeTreeData.fire()
        })
      })
    }
  }

  getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
    return element
  }
  getChildren(element?: TreeItem | undefined): ProviderResult<TreeItem[]> {
    if (element) {
      if (workspace.workspaceFolders && workspace.workspaceFolders.length > 1) {
        const folder = workspace.workspaceFolders.find(f => f.name === element.label)
        if (folder) {
          const testResults = this.workspaceFolders[folder.uri.fsPath]
          return Promise.resolve(testResults ? getTestResultsTree(testResults) : [new TreeItem('No test data available')])
        }
      }
      return Promise.resolve([])
    }

    if (!workspace.workspaceFolders) {
      return Promise.resolve([new TreeItem('Please open a folder or workspace')])
    }

    if (workspace.workspaceFolders.length === 1) {
      const testResults = this.workspaceFolders[workspace.workspaceFolders[0].uri.fsPath]
      return Promise.resolve(testResults ? getTestResultsTree(testResults) : [new TreeItem('No test data available')])
    }
    else {
      return Promise.resolve(workspace.workspaceFolders.map(f => new TreeItem(f.name, TreeItemCollapsibleState.Collapsed)))
    }
  }
}

function getTestResultsTree({ coverage, full, last, latest }: WorkspaceFolderTestResults) {
  return [
    new PassStats(full, latest, last),
    new SkipStats(full, latest, last),
    new StatementCoverageStats(coverage, latest, last),
    new BranchCoverageStats(coverage, latest, last),
    new FunctionCoverageStats(coverage, latest, last),
    new LineCoverageStats(coverage, latest, last),
  ]
}
class PassStats extends TreeItem {
  constructor(
    public readonly full: TestResults | undefined,
    public readonly latest: TestResults,
    public readonly last: TestResults | undefined,
  ) {
    super(`no pass data available`);
    const result = full || latest

    this.label = `${getBar(1 - (result.numFailedTests / result.numTotalTests))} passed${full !== latest ? ' (outdated)' : ''}`

    const emotion = getEmotion(1 - (latest.numFailedTests / latest.numTotalTests), last ? 1 - (last.numFailedTests / last.numTotalTests) : undefined)
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
    super(`no skip data available`);
    const result = full || latest

    this.label = `${getBar((result.numTotalTests - result.numPassedTests - result.numFailedTests) / result.numTotalTests)} skipped${full !== latest ? ' (outdated)' : ''}`

    const emotion = getEmotion(1 - ((latest.numTotalTests - latest.numPassedTests - latest.numFailedTests) / latest.numTotalTests), last ?
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

class BranchCoverageStats extends TreeItem {
  constructor(
    public readonly covered: TestResults | undefined,
    public readonly latest: TestResults,
    public readonly last: TestResults | undefined,
  ) {
    super(`no branch coverage info available`);
    if (covered && covered.coverage) {
      this.label = `${getBar(covered.coverage.branches.covered / covered.coverage.branches.total || 0)} branch${covered !== latest ? ' (outdated)' : ''} `

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
    super(`no function coverage info available`);
    if (covered && covered.coverage) {
      this.label = `${getBar(covered.coverage.functions.covered / covered.coverage.functions.total || 0)} function${covered !== latest ? ' (outdated)' : ''} `

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
    super(`no line coverage info available`);
    if (covered && covered.coverage) {
      this.label = `${getBar(covered.coverage.lines.covered / covered.coverage.lines.total || 0)} line${covered !== latest ? ' (outdated)' : ''} `

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
    super(`no statement coverage info available`, TreeItemCollapsibleState.None);
    if (covered && covered.coverage) {
      this.label = `${getBar(covered.coverage.statements.covered / covered.coverage.statements.total || 0)} statement${covered !== latest ? ' (outdated)' : ''} `

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

  return `[${bar.substr(0, index) + '|' + bar.substr(index < Number.EPSILON ? 0 : index + 1)}] ${(percentage * 100).toFixed(1)}% `
}

function getEmotion(pct: number, lastPct: number | undefined) {
  if (lastPct === undefined || Math.abs(pct - lastPct) < Number.EPSILON) {
    return Math.abs(pct - 1) < Number.EPSILON ?
      'great' :
      pct >= .98 ?
        'good' :
        pct >= 80 ?
          'meh' :
          'bad'
  }
  return pct > lastPct ? 'up' : 'down'
}

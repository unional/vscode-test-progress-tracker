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
  constructor() {
    // TODO: get active file and use `workspace.getWorkspaceFolder(uri)` to get the active folder, and monitor it.
    // Close the last subscription too.
    if (workspace.workspaceFolders && workspace.workspaceFolders[0])
      onchange({ rootDir: workspace.workspaceFolders[0].uri.fsPath, showErrorMessage: window.showErrorMessage }, testResults => {
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
      new PassStats(this.lastFullResults, this.latestResults),
      new SkipStats(this.lastFullResults, this.latestResults),
      new StatementCoverageStats(this.lastCoverageResults, this.latestResults),
      new BranchCoverageStats(this.lastCoverageResults, this.latestResults),
      new FunctionCoverageStats(this.lastCoverageResults, this.latestResults),
      new LineCoverageStats(this.lastCoverageResults, this.latestResults),
    ])
  }


}
class PassStats extends TreeItem {
  constructor(
    public readonly full: TestResults | undefined,
    public readonly latest: TestResults,
  ) {
    super(`pass`, TreeItemCollapsibleState.None);
    const result = full || latest

    this.label = `${getBar(result.numPassedTests / result.numTotalTests)} passed${full !== latest ? '*' : ''}`
  }

  get tooltip(): string {
    return this.full !== this.latest ? 'latest test run is filtered, remove filter to see updated full report' : ''
  }

  iconPath = {
    light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'dependency.svg'),
    dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'dependency.svg')
  };
}

class SkipStats extends TreeItem {
  constructor(public readonly full: TestResults | undefined, public readonly latest: TestResults) {
    super(`skip`, TreeItemCollapsibleState.None);
    const result = full || latest

    this.label = `${getBar(result.numTotalTests - result.numPassedTests - result.numFailedTests / result.numTotalTests)} skipped${full !== latest ? '*' : ''}`
  }

  get tooltip(): string {
    return this.full !== this.latest ? 'latest test run is filtered, remove filter to see updated full report' : ''
  }

  iconPath = {
    light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'dependency.svg'),
    dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'dependency.svg')
  };
}

class NoStats extends TreeItem {
  constructor(
  ) {
    super(`no progress data`, TreeItemCollapsibleState.None);
  }

  iconPath = {
    light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'dependency.svg'),
    dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'dependency.svg')
  };
}

class BranchCoverageStats extends TreeItem {
  constructor(public readonly covered: TestResults | undefined, public readonly latest: TestResults) {
    super(`no branch coverage info`, TreeItemCollapsibleState.None);
    if (covered && covered.coverage) {
      this.label = `${getBar(covered.coverage.branches.covered / covered.coverage.branches.total)} branch${covered !== latest ? '*' : ''} `
    }
  }

  get tooltip(): string {
    return this.covered !== this.latest ? 'latest test run has no coverage info, enable coverage to see lastest coverage report' : ''
  }

  iconPath = {
    light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'dependency.svg'),
    dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'dependency.svg')
  };
}

class FunctionCoverageStats extends TreeItem {
  constructor(public readonly covered: TestResults | undefined, public readonly latest: TestResults) {
    super(`no function coverage info`, TreeItemCollapsibleState.None);
    if (covered && covered.coverage) {
      this.label = `${getBar(covered.coverage.functions.covered / covered.coverage.functions.total)} function${covered !== latest ? '*' : ''} `
    }
  }

  get tooltip(): string {
    return this.covered !== this.latest ? 'latest test run has no coverage info, enable coverage to see lastest coverage report' : ''
  }

  iconPath = {
    light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'dependency.svg'),
    dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'dependency.svg')
  };
}

class LineCoverageStats extends TreeItem {
  constructor(public readonly covered: TestResults | undefined, public readonly latest: TestResults) {
    super(`no line coverage info`, TreeItemCollapsibleState.None);
    if (covered && covered.coverage) {
      this.label = `${getBar(covered.coverage.lines.covered / covered.coverage.lines.total)} line${covered !== latest ? '*' : ''} `
    }
  }

  get tooltip(): string {
    return this.covered !== this.latest ? 'latest test run has no coverage info, enable coverage to see lastest coverage report' : ''
  }

  iconPath = {
    light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'dependency.svg'),
    dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'dependency.svg')
  };
}

class StatementCoverageStats extends TreeItem {
  constructor(public readonly covered: TestResults | undefined, public readonly latest: TestResults) {
    super(`no statement coverage info`, TreeItemCollapsibleState.None);
    if (covered && covered.coverage) {
      this.label = `${getBar(covered.coverage.statements.covered / covered.coverage.statements.total)} statement${covered !== latest ? '*' : ''} `
    }
  }

  get tooltip(): string {
    return this.covered !== this.latest ? 'latest test run has no coverage info, enable coverage to see lastest coverage report' : ''
  }

  iconPath = {
    light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'dependency.svg'),
    dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'dependency.svg')
  };
}

function getBar(percentage: number) {
  const bar = `----------------------------------------`
  const index = Math.floor(percentage * bar.length)

  return `[${bar.substr(0, index) + '|' + bar.substr(index + 1)}] ${(percentage * 100).toFixed(1)}% `
}

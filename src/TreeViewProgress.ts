import { Event, EventEmitter, ProviderResult, TreeDataProvider, TreeItem, TreeItemCollapsibleState, window, workspace } from 'vscode';
import { BranchCoverageStats } from './BranchCoverageStats';
import { FunctionCoverageStats } from './FunctionCoverageStats';
import { WorkspaceFolderTestSnapshot } from './interfaces';
import { LineCoverageStats } from './LineCoverageStats';
import { loadInitialSnapshot } from './loadInitialSnapshot';
import { onchange } from './onchange';
import { PassStats } from './PassStats';
import { SkipStats } from './SkipStats';
import { StatementCoverageStats } from './StatementCoverageStats';

export class TreeViewProgress implements TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData: EventEmitter<TreeItem | undefined> = new EventEmitter<TreeItem | undefined>();
  readonly onDidChangeTreeData: Event<TreeItem | undefined> = this._onDidChangeTreeData.event;
  private testSnapshots: { [k: string]: WorkspaceFolderTestSnapshot | undefined } = {}
  private loading = true
  constructor() {
    if (workspace.workspaceFolders) {
      // tslint:disable-next-line: no-floating-promises
      Promise.all(workspace.workspaceFolders.map(async folder => {
        const rootDir = folder.uri.fsPath
        this.testSnapshots[rootDir] = await loadInitialSnapshot(rootDir)
        onchange({ showErrorMessage: window.showErrorMessage }, rootDir, testResults => {
          this.testSnapshots[rootDir] = {
            latest: testResults,
            last: this.testSnapshots[rootDir] && this.testSnapshots[rootDir]!.latest,
            full: !testResults.filtered ? testResults : this.testSnapshots[rootDir] && this.testSnapshots[rootDir]!.full,
            coverage: testResults.coverage ? testResults : this.testSnapshots[rootDir] && this.testSnapshots[rootDir]!.coverage
          }

          this._onDidChangeTreeData.fire()
        })
      })).then(() => this.loading = false)
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
          const testResults = this.testSnapshots[folder.uri.fsPath]
          return Promise.resolve(testResults ? getTestResultsTree(testResults) : [new TreeItem('No test data available')])
        }
      }
      return Promise.resolve([])
    }

    if (!workspace.workspaceFolders) {
      return Promise.resolve([new TreeItem('Please open a folder or workspace')])
    }

    if (this.loading) {
      return Promise.resolve([new TreeItem('loading...')])
    }

    if (workspace.workspaceFolders.length === 1) {
      const testResults = this.testSnapshots[workspace.workspaceFolders[0].uri.fsPath]
      return Promise.resolve(testResults ? getTestResultsTree(testResults) : [new TreeItem('No test data available')])
    }
    else {
      return Promise.resolve(workspace.workspaceFolders.map(f => new TreeItem(f.name, TreeItemCollapsibleState.Collapsed)))
    }
  }
}

function getTestResultsTree({ coverage, full, last, latest }: WorkspaceFolderTestSnapshot) {
  return [
    new PassStats(full, latest, last),
    new SkipStats(full, latest, last),
    new StatementCoverageStats(coverage, latest, last),
    new BranchCoverageStats(coverage, latest, last),
    new FunctionCoverageStats(coverage, latest, last),
    new LineCoverageStats(coverage, latest, last),
  ]
}

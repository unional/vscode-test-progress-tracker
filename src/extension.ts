import { ExtensionContext, window } from 'vscode';
import { TreeViewProgress } from './TreeViewProgress';

export function activate(context: ExtensionContext) {
  window.registerTreeDataProvider('progressTrackerTreeView', new TreeViewProgress())
  // context.subscriptions.push(vscode.commands.registerCommand('projectStats.show', () => {
  //   const panel = vscode.window.createWebviewPanel(
  //     'dummyView',
  //     'Project Stats',
  //     vscode.ViewColumn.One,
  //     {
  //       enableScripts: true
  //     }
  //   )

  //   panel.webview.html = getWebviewContent()

  // }));
}

// function getWebviewContent() {
//   return `<!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Cat Coding</title>
// </head>
// <body>
//   <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
// </body>
// </html>`;
// }

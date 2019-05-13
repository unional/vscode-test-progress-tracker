/**
 * Exposes the Visual Studio Code extension API to the Jest testing environment.
 *
 * Tests would otherwise not have access because they are sandboxed.
 *
 * @see jest-vscode-framework-setup.ts
 */
import NodeEnvironment from 'jest-environment-node';

class VsCodeEnvironment extends NodeEnvironment {
  vscode: any
  constructor(config: any) {
    super(config);
    this.vscode = require('vscode')
  }

  public async setup() {
    await super.setup();
    this.global.vscode = this.vscode;
  }

  public async teardown() {
    this.global.vscode = {};
    await super.teardown();
  }
}

module.exports = VsCodeEnvironment;

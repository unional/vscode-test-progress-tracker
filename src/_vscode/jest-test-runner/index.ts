import path from 'path';

const fromConfigDir = (filename: string) => path.resolve(__dirname, filename);

export const jestConfig = {
  presets: 'ts-jest',
  runInBand: true, // Required due to the way the "vscode" module is injected.
  testMatch: ['**/*.(vscode-spec).ts'],
  // testMatch: ['**/*.(system|unit|spec).ts'],
  testEnvironment: fromConfigDir('jest-vscode-environment.js'),
  reporters: [
    'default',
    ['jest-audio-reporter', { volume: 0.3 }],
  ],
  setupTestFrameworkScriptFile: fromConfigDir('jest-vscode-framework-setup.js')
};

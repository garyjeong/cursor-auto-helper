module.exports = {
  window: {
    showInformationMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    showInputBox: jest.fn(),
    createStatusBarItem: jest.fn(() => ({
      show: jest.fn(),
      dispose: jest.fn(),
      text: '',
      tooltip: '',
      command: ''
    })),
    tabGroups: {
      all: []
    }
  },
  StatusBarAlignment: {
    Right: 2
  },
  workspace: {
    getConfiguration: jest.fn(() => ({
      get: jest.fn((key, defaultValue) => defaultValue),
      update: jest.fn()
    })),
    onDidChangeConfiguration: jest.fn(() => ({
      dispose: jest.fn()
    }))
  },
  ConfigurationTarget: {
    Global: 1
  },
  extensions: {
    getExtension: jest.fn(() => ({
      isActive: true,
      activate: jest.fn()
    }))
  },
  commands: {
    registerCommand: jest.fn(),
    getCommands: jest.fn(() => Promise.resolve([
      'cursorAutoResumer.enable',
      'cursorAutoResumer.disable',
      'cursorAutoResumer.checkNow',
      'cursorAutoResumer.toggleDebug',
      'cursorAutoResumer.addCustomSelector',
      'cursorAutoResumer.showStatus'
    ]))
  }
}; 
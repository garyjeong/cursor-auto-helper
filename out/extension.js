"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const agentWatcher_1 = require("./agentWatcher");
const config_1 = require("./config");
let agentWatcher;
let configManager;
function activate(context) {
    console.log("Cursor Auto Resumer extension is now active!");
    configManager = config_1.ConfigManager.getInstance();
    agentWatcher = new agentWatcher_1.AgentWatcher();
    // Register commands
    const commands = [
        vscode.commands.registerCommand("cursorAutoResumer.enable", async () => {
            await configManager.updateConfig("enabled", true);
            agentWatcher?.start();
            vscode.window.showInformationMessage("Cursor Auto Resumer enabled");
        }),
        vscode.commands.registerCommand("cursorAutoResumer.disable", async () => {
            await configManager.updateConfig("enabled", false);
            agentWatcher?.stop();
            vscode.window.showInformationMessage("Cursor Auto Resumer disabled");
        }),
        vscode.commands.registerCommand("cursorAutoResumer.checkNow", async () => {
            if (!agentWatcher) {
                vscode.window.showErrorMessage("Agent Watcher not initialized");
                return;
            }
            const result = await agentWatcher.checkNow();
            const message = `Check completed: ${result.panelsFound} panels found, ${result.buttonsClicked} buttons clicked`;
            if (result.errors.length > 0) {
                vscode.window.showWarningMessage(`${message}. Errors: ${result.errors.length}`);
            }
            else {
                vscode.window.showInformationMessage(message);
            }
        }),
        vscode.commands.registerCommand("cursorAutoResumer.toggleDebug", async () => {
            const config = configManager.getConfig();
            const newDebugMode = !config.debugMode;
            await configManager.updateConfig("debugMode", newDebugMode);
            const message = `Debug mode ${newDebugMode ? "enabled" : "disabled"}`;
            vscode.window.showInformationMessage(message);
            configManager.log(message);
        }),
        vscode.commands.registerCommand("cursorAutoResumer.addCustomSelector", async () => {
            const selector = await vscode.window.showInputBox({
                prompt: "Enter a CSS selector for resume buttons",
                placeHolder: 'e.g., .my-resume-button, [data-action="resume"]',
                validateInput: (value) => {
                    if (!value || value.trim().length === 0) {
                        return "Selector cannot be empty";
                    }
                    try {
                        document.querySelector(value);
                        return null;
                    }
                    catch {
                        return "Invalid CSS selector";
                    }
                },
            });
            if (selector) {
                const config = configManager.getConfig();
                const newSelectors = [...config.customSelectors, selector.trim()];
                await configManager.updateConfig("customSelectors", newSelectors);
                vscode.window.showInformationMessage(`Custom selector added: ${selector}`);
            }
        }),
        vscode.commands.registerCommand("cursorAutoResumer.showStatus", () => {
            if (!agentWatcher) {
                vscode.window.showErrorMessage("Agent Watcher not initialized");
                return;
            }
            const status = agentWatcher.getStatus();
            const config = configManager.getConfig();
            const statusMessage = [
                `Status: ${status.isActive ? "Active" : "Inactive"}`,
                `Panels monitored: ${status.panelCount}`,
                `Check interval: ${config.checkInterval}ms`,
                `Debug mode: ${config.debugMode ? "On" : "Off"}`,
                `Custom selectors: ${config.customSelectors.length}`,
                `Skip button: ${config.skipButtonEnabled ? "Enabled" : "Disabled"}`,
                `Skip delay: ${config.skipButtonDelay}ms`,
                `Skip custom selectors: ${config.skipButtonCustomSelectors.length}`,
            ].join("\n");
            vscode.window.showInformationMessage(statusMessage, { modal: true });
        }),
        vscode.commands.registerCommand("cursorAutoResumer.enableSkip", async () => {
            await configManager.updateConfig("skipButtonEnabled", true);
            vscode.window.showInformationMessage("Skip button functionality enabled");
        }),
        vscode.commands.registerCommand("cursorAutoResumer.disableSkip", async () => {
            await configManager.updateConfig("skipButtonEnabled", false);
            vscode.window.showInformationMessage("Skip button functionality disabled");
        }),
        vscode.commands.registerCommand("cursorAutoResumer.setSkipDelay", async () => {
            const delayInput = await vscode.window.showInputBox({
                prompt: "Enter skip button delay in seconds",
                placeHolder: "5",
                validateInput: (value) => {
                    const num = parseFloat(value);
                    if (isNaN(num) || num < 1 || num > 30) {
                        return "Delay must be between 1 and 30 seconds";
                    }
                    return null;
                },
            });
            if (delayInput) {
                const delayMs = parseFloat(delayInput) * 1000;
                await configManager.updateConfig("skipButtonDelay", delayMs);
                vscode.window.showInformationMessage(`Skip button delay set to ${delayInput} seconds`);
            }
        }),
    ];
    // Register all commands
    commands.forEach((command) => context.subscriptions.push(command));
    // Listen for configuration changes
    const configChangeListener = vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("cursorAutoResumer")) {
            configManager.refresh();
            const config = configManager.getConfig();
            if (config.enabled && !agentWatcher?.getStatus().isActive) {
                agentWatcher?.start();
            }
            else if (!config.enabled && agentWatcher?.getStatus().isActive) {
                agentWatcher?.stop();
            }
            configManager.log("Configuration updated");
        }
    });
    context.subscriptions.push(configChangeListener);
    // Start the watcher if enabled
    const config = configManager.getConfig();
    if (config.enabled) {
        agentWatcher.start();
    }
    // Add disposables
    context.subscriptions.push({
        dispose: () => {
            agentWatcher?.dispose();
        },
    });
    configManager.log("Extension activated successfully");
}
function deactivate() {
    agentWatcher?.dispose();
    configManager?.log("Extension deactivated");
}
//# sourceMappingURL=extension.js.map
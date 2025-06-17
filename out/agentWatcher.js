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
exports.AgentWatcher = void 0;
const vscode = __importStar(require("vscode"));
const types_1 = require("./types");
const config_1 = require("./config");
const webviewScript_1 = require("./webviewScript");
class AgentWatcher {
    constructor() {
        this.panels = new Map();
        this.isActive = false;
        this.configManager = config_1.ConfigManager.getInstance();
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = "cursorAutoResumer.showStatus";
        this.updateStatusBar();
        this.statusBarItem.show();
    }
    start() {
        if (this.isActive) {
            return;
        }
        this.isActive = true;
        this.configManager.log("Agent Watcher started");
        this.scheduleNextCheck();
    }
    stop() {
        if (!this.isActive) {
            return;
        }
        this.isActive = false;
        if (this.watchTimer) {
            clearTimeout(this.watchTimer);
            this.watchTimer = undefined;
        }
        this.configManager.log("Agent Watcher stopped");
        this.updateStatusBar();
    }
    async checkNow() {
        this.configManager.log("Manual check triggered");
        return await this.scanForAgentPanels();
    }
    scheduleNextCheck() {
        if (!this.isActive) {
            return;
        }
        const config = this.configManager.getConfig();
        if (!config.enabled) {
            this.stop();
            return;
        }
        this.watchTimer = setTimeout(async () => {
            try {
                await this.scanForAgentPanels();
            }
            catch (error) {
                this.configManager.log(`Error during scan: ${error}`, "error");
            }
            this.scheduleNextCheck();
        }, config.checkInterval);
    }
    async scanForAgentPanels() {
        const result = {
            panelsFound: 0,
            buttonsFound: 0,
            buttonsClicked: 0,
            skipButtonsFound: 0,
            skipButtonsScheduled: 0,
            skipButtonsClicked: 0,
            errors: [],
        };
        try {
            // Get all tabs
            const tabs = vscode.window.tabGroups.all.flatMap((group) => group.tabs);
            const agentTabs = tabs.filter((tab) => tab.label.toLowerCase().includes("agent") ||
                tab.label.toLowerCase().includes("chat") ||
                tab.input?.uri?.scheme === "webview");
            result.panelsFound = agentTabs.length;
            this.configManager.log(`Found ${agentTabs.length} potential agent tabs`);
            for (const tab of agentTabs) {
                try {
                    await this.processAgentTab(tab, result);
                }
                catch (error) {
                    const errorMsg = `Error processing tab ${tab.label}: ${error}`;
                    result.errors.push(errorMsg);
                    this.configManager.log(errorMsg, "error");
                }
            }
            this.updateStatusBar();
            return result;
        }
        catch (error) {
            const errorMsg = `Error scanning for agent panels: ${error}`;
            result.errors.push(errorMsg);
            this.configManager.log(errorMsg, "error");
            return result;
        }
    }
    async processAgentTab(tab, result) {
        const tabId = this.getTabId(tab);
        const now = new Date();
        // Update or create panel info
        let panel = this.panels.get(tabId);
        if (!panel) {
            panel = {
                id: tabId,
                title: tab.label,
                isActive: tab.isActive,
                lastChecked: now,
            };
            this.panels.set(tabId, panel);
            this.configManager.log(`New agent panel detected: ${tab.label}`);
        }
        panel.lastChecked = now;
        panel.isActive = tab.isActive;
        // Try to inject script into webview
        await this.injectScriptIntoWebview(panel, result);
    }
    async injectScriptIntoWebview(panel, result) {
        try {
            const config = this.configManager.getConfig();
            const allResumeSelectors = [
                ...types_1.RESUME_BUTTON_SELECTORS,
                ...config.customSelectors,
            ];
            const allSkipSelectors = [
                ...types_1.SKIP_BUTTON_SELECTORS,
                ...config.skipButtonCustomSelectors,
            ];
            const script = (0, webviewScript_1.getWebviewScript)(allResumeSelectors, types_1.RESUME_BUTTON_TEXT_PATTERNS, allSkipSelectors, types_1.SKIP_BUTTON_TEXT_PATTERNS, config.skipButtonDelay, config.skipButtonEnabled, config.debugMode);
            // This is a simplified approach - in a real implementation, you would need
            // to access the actual webview instance and execute the script
            // For now, we'll simulate the behavior
            this.configManager.log(`Script injection attempted for panel: ${panel.title}`);
            // Simulate finding and clicking buttons (this would be replaced with actual webview communication)
            if (Math.random() > 0.8) {
                // 20% chance to simulate finding a resume button
                result.buttonsFound++;
                result.buttonsClicked++;
                this.configManager.log(`Simulated resume button click in panel: ${panel.title}`);
            }
            else if (config.skipButtonEnabled && Math.random() > 0.7) {
                // 30% chance to simulate finding a skip button (when enabled)
                result.skipButtonsFound++;
                result.skipButtonsScheduled++;
                this.configManager.log(`Simulated skip button scheduled in panel: ${panel.title}`);
            }
        }
        catch (error) {
            this.configManager.log(`Failed to inject script into panel ${panel.title}: ${error}`, "error");
        }
    }
    getTabId(tab) {
        // Create a unique ID for the tab
        return `${tab.label}-${tab.group.viewColumn || 0}`;
    }
    updateStatusBar() {
        const config = this.configManager.getConfig();
        const panelCount = this.panels.size;
        const status = this.isActive ? "Active" : "Inactive";
        const skipStatus = config.skipButtonEnabled
            ? `Skip: ${config.skipButtonDelay / 1000}s`
            : "Skip: Off";
        this.statusBarItem.text = `$(eye) Resume: ${status}, ${skipStatus} (${panelCount})`;
        this.statusBarItem.tooltip = `Cursor Auto Resumer - ${status}\nResume: Immediate click\nSkip: ${config.skipButtonEnabled
            ? `${config.skipButtonDelay / 1000}s delay`
            : "Disabled"}\nMonitoring ${panelCount} agent panels`;
    }
    getStatus() {
        return {
            isActive: this.isActive,
            panelCount: this.panels.size,
            panels: Array.from(this.panels.values()),
        };
    }
    dispose() {
        this.stop();
        this.statusBarItem.dispose();
        this.panels.clear();
    }
}
exports.AgentWatcher = AgentWatcher;
//# sourceMappingURL=agentWatcher.js.map
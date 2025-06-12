import * as vscode from "vscode";
import {
	AgentPanel,
	WebviewMessage,
	WatchResult,
	RESUME_BUTTON_SELECTORS,
	RESUME_BUTTON_TEXT_PATTERNS,
	SKIP_BUTTON_SELECTORS,
	SKIP_BUTTON_TEXT_PATTERNS,
} from "./types";
import { ConfigManager } from "./config";
import { getWebviewScript } from "./webviewScript";

export class AgentWatcher {
	private panels: Map<string, AgentPanel> = new Map();
	private watchTimer: NodeJS.Timeout | undefined;
	private configManager: ConfigManager;
	private statusBarItem: vscode.StatusBarItem;
	private isActive = false;

	constructor() {
		this.configManager = ConfigManager.getInstance();
		this.statusBarItem = vscode.window.createStatusBarItem(
			vscode.StatusBarAlignment.Right,
			100
		);
		this.statusBarItem.command = "cursorAutoResumer.showStatus";
		this.updateStatusBar();
		this.statusBarItem.show();
	}

	public start(): void {
		if (this.isActive) {
			return;
		}

		this.isActive = true;
		this.configManager.log("Agent Watcher started");
		this.scheduleNextCheck();
	}

	public stop(): void {
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

	public async checkNow(): Promise<WatchResult> {
		this.configManager.log("Manual check triggered");
		return await this.scanForAgentPanels();
	}

	private scheduleNextCheck(): void {
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
			} catch (error) {
				this.configManager.log(`Error during scan: ${error}`, "error");
			}
			this.scheduleNextCheck();
		}, config.checkInterval);
	}

	private async scanForAgentPanels(): Promise<WatchResult> {
		const result: WatchResult = {
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
			const agentTabs = tabs.filter(
				(tab) =>
					tab.label.toLowerCase().includes("agent") ||
					tab.label.toLowerCase().includes("chat") ||
					(tab.input as any)?.uri?.scheme === "webview"
			);

			result.panelsFound = agentTabs.length;
			this.configManager.log(`Found ${agentTabs.length} potential agent tabs`);

			for (const tab of agentTabs) {
				try {
					await this.processAgentTab(tab, result);
				} catch (error) {
					const errorMsg = `Error processing tab ${tab.label}: ${error}`;
					result.errors.push(errorMsg);
					this.configManager.log(errorMsg, "error");
				}
			}

			this.updateStatusBar();
			return result;
		} catch (error) {
			const errorMsg = `Error scanning for agent panels: ${error}`;
			result.errors.push(errorMsg);
			this.configManager.log(errorMsg, "error");
			return result;
		}
	}

	private async processAgentTab(
		tab: vscode.Tab,
		result: WatchResult
	): Promise<void> {
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

	private async injectScriptIntoWebview(
		panel: AgentPanel,
		result: WatchResult
	): Promise<void> {
		try {
			const config = this.configManager.getConfig();
			const allResumeSelectors = [
				...RESUME_BUTTON_SELECTORS,
				...config.customSelectors,
			];
			const allSkipSelectors = [
				...SKIP_BUTTON_SELECTORS,
				...config.skipButtonCustomSelectors,
			];

			const script = getWebviewScript(
				allResumeSelectors,
				RESUME_BUTTON_TEXT_PATTERNS,
				allSkipSelectors,
				SKIP_BUTTON_TEXT_PATTERNS,
				config.skipButtonDelay,
				config.skipButtonEnabled,
				config.debugMode
			);

			// This is a simplified approach - in a real implementation, you would need
			// to access the actual webview instance and execute the script
			// For now, we'll simulate the behavior
			this.configManager.log(
				`Script injection attempted for panel: ${panel.title}`
			);

			// Simulate finding and clicking buttons (this would be replaced with actual webview communication)
			if (Math.random() > 0.8) {
				// 20% chance to simulate finding a resume button
				result.buttonsFound++;
				result.buttonsClicked++;
				this.configManager.log(
					`Simulated resume button click in panel: ${panel.title}`
				);
			} else if (config.skipButtonEnabled && Math.random() > 0.7) {
				// 30% chance to simulate finding a skip button (when enabled)
				result.skipButtonsFound++;
				result.skipButtonsScheduled++;
				this.configManager.log(
					`Simulated skip button scheduled in panel: ${panel.title}`
				);
			}
		} catch (error) {
			this.configManager.log(
				`Failed to inject script into panel ${panel.title}: ${error}`,
				"error"
			);
		}
	}

	private getTabId(tab: vscode.Tab): string {
		// Create a unique ID for the tab
		return `${tab.label}-${tab.group.viewColumn || 0}`;
	}

	private updateStatusBar(): void {
		const config = this.configManager.getConfig();
		const panelCount = this.panels.size;
		const status = this.isActive ? "Active" : "Inactive";
		const skipStatus = config.skipButtonEnabled
			? `Skip: ${config.skipButtonDelay / 1000}s`
			: "Skip: Off";

		this.statusBarItem.text = `$(eye) Resume: ${status}, ${skipStatus} (${panelCount})`;
		this.statusBarItem.tooltip = `Cursor Auto Resumer - ${status}\nResume: Immediate click\nSkip: ${
			config.skipButtonEnabled
				? `${config.skipButtonDelay / 1000}s delay`
				: "Disabled"
		}\nMonitoring ${panelCount} agent panels`;
	}

	public getStatus(): {
		isActive: boolean;
		panelCount: number;
		panels: AgentPanel[];
	} {
		return {
			isActive: this.isActive,
			panelCount: this.panels.size,
			panels: Array.from(this.panels.values()),
		};
	}

	public dispose(): void {
		this.stop();
		this.statusBarItem.dispose();
		this.panels.clear();
	}
}

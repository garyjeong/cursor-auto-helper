import * as vscode from "vscode";
import { ExtensionConfig, DEFAULT_CONFIG } from "./types";

export class ConfigManager {
	private static instance: ConfigManager;
	private config: vscode.WorkspaceConfiguration;

	private constructor() {
		this.config = vscode.workspace.getConfiguration("cursorAutoResumer");
	}

	public static getInstance(): ConfigManager {
		if (!ConfigManager.instance) {
			ConfigManager.instance = new ConfigManager();
		}
		return ConfigManager.instance;
	}

	public getConfig(): ExtensionConfig {
		return {
			enabled: this.config.get("enabled", DEFAULT_CONFIG.enabled),
			checkInterval: this.config.get(
				"checkInterval",
				DEFAULT_CONFIG.checkInterval
			),
			customSelectors: this.config.get(
				"customSelectors",
				DEFAULT_CONFIG.customSelectors
			),
			debugMode: this.config.get("debugMode", DEFAULT_CONFIG.debugMode),
		};
	}

	public async updateConfig(
		key: keyof ExtensionConfig,
		value: any
	): Promise<void> {
		await this.config.update(key, value, vscode.ConfigurationTarget.Global);
		this.refresh();
	}

	public refresh(): void {
		this.config = vscode.workspace.getConfiguration("cursorAutoResumer");
	}

	public validateConfig(config: ExtensionConfig): string[] {
		const errors: string[] = [];

		if (config.checkInterval < 500 || config.checkInterval > 10000) {
			errors.push("Check interval must be between 500 and 10000 milliseconds");
		}

		if (!Array.isArray(config.customSelectors)) {
			errors.push("Custom selectors must be an array");
		}

		return errors;
	}

	public log(message: string, level: "info" | "warn" | "error" = "info"): void {
		const config = this.getConfig();
		if (config.debugMode || level === "error") {
			const timestamp = new Date().toISOString();
			const logMessage = `[${timestamp}] [Cursor Auto Resumer] ${message}`;

			switch (level) {
				case "error":
					console.error(logMessage);
					break;
				case "warn":
					console.warn(logMessage);
					break;
				default:
					console.log(logMessage);
			}
		}
	}
}

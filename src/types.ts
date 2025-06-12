export interface AgentPanel {
	id: string;
	title: string;
	webview?: any;
	isActive: boolean;
	lastChecked: Date;
}

export interface ExtensionConfig {
	enabled: boolean;
	checkInterval: number;
	customSelectors: string[];
	debugMode: boolean;
}

export interface WebviewMessage {
	type: "resume-button-found" | "resume-button-clicked" | "debug-log" | "error";
	data?: any;
	timestamp: number;
}

export interface WatchResult {
	panelsFound: number;
	buttonsFound: number;
	buttonsClicked: number;
	errors: string[];
}

export const DEFAULT_CONFIG: ExtensionConfig = {
	enabled: true,
	checkInterval: 1000,
	customSelectors: [],
	debugMode: false,
};

export const RESUME_BUTTON_SELECTORS = [
	'button[aria-label*="resume" i]',
	'button[title*="resume" i]',
	'button:contains("Resume")',
	'button:contains("Continue")',
	".resume-button",
	".continue-button",
	'[data-testid*="resume"]',
	'[data-testid*="continue"]',
	'button[class*="resume"]',
	'button[class*="continue"]',
];

export const RESUME_BUTTON_TEXT_PATTERNS = [
	/resume/i,
	/continue/i,
	/계속/i,
	/재개/i,
	/다시\s*시작/i,
];

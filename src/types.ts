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
	skipButtonEnabled: boolean;
	skipButtonDelay: number;
	skipButtonCustomSelectors: string[];
}

export interface WebviewMessage {
	type:
		| "resume-button-found"
		| "resume-button-clicked"
		| "skip-button-found"
		| "skip-button-clicked"
		| "skip-button-scheduled"
		| "skip-button-cancelled"
		| "debug-log"
		| "error";
	data?: any;
	timestamp: number;
}

export interface WatchResult {
	panelsFound: number;
	buttonsFound: number;
	buttonsClicked: number;
	skipButtonsFound: number;
	skipButtonsScheduled: number;
	skipButtonsClicked: number;
	errors: string[];
}

export const DEFAULT_CONFIG: ExtensionConfig = {
	enabled: true,
	checkInterval: 1000,
	customSelectors: [],
	debugMode: false,
	skipButtonEnabled: true,
	skipButtonDelay: 5000,
	skipButtonCustomSelectors: [],
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

export const SKIP_BUTTON_SELECTORS = [
	'button[aria-label*="skip" i]',
	'button[title*="skip" i]',
	'button:contains("Skip")',
	'button:contains("건너뛰기")',
	".skip-button",
	'[data-testid*="skip"]',
	'button[class*="skip"]',
];

export const SKIP_BUTTON_TEXT_PATTERNS = [
	/skip/i,
	/건너뛰기/i,
	/생략/i,
	/넘어가기/i,
];

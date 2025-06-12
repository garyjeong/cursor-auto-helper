import { AgentWatcher } from "../src/agentWatcher";
import { ConfigManager } from "../src/config";
import { getWebviewScript } from "../src/webviewScript";
import {
	RESUME_BUTTON_SELECTORS,
	RESUME_BUTTON_TEXT_PATTERNS,
} from "../src/types";

// Mock vscode module
jest.mock("vscode", () => ({
	window: {
		createStatusBarItem: jest.fn(() => ({
			show: jest.fn(),
			dispose: jest.fn(),
			text: "",
			tooltip: "",
			command: "",
		})),
		tabGroups: {
			all: [],
		},
		showInformationMessage: jest.fn(),
		showErrorMessage: jest.fn(),
		showWarningMessage: jest.fn(),
	},
	StatusBarAlignment: {
		Right: 2,
	},
	workspace: {
		getConfiguration: jest.fn(() => ({
			get: jest.fn((key: string, defaultValue: any) => defaultValue),
		})),
	},
	ConfigurationTarget: {
		Global: 1,
	},
}));

describe("AgentWatcher", () => {
	let agentWatcher: AgentWatcher;

	beforeEach(() => {
		agentWatcher = new AgentWatcher();
	});

	afterEach(() => {
		agentWatcher.dispose();
	});

	test("should initialize correctly", () => {
		expect(agentWatcher).toBeDefined();
		const status = agentWatcher.getStatus();
		expect(status.isActive).toBe(false);
		expect(status.panelCount).toBe(0);
	});

	test("should start and stop correctly", () => {
		agentWatcher.start();
		expect(agentWatcher.getStatus().isActive).toBe(true);

		agentWatcher.stop();
		expect(agentWatcher.getStatus().isActive).toBe(false);
	});

	test("should handle checkNow", async () => {
		const result = await agentWatcher.checkNow();
		expect(result).toBeDefined();
		expect(result.panelsFound).toBeGreaterThanOrEqual(0);
		expect(result.buttonsFound).toBeGreaterThanOrEqual(0);
		expect(result.buttonsClicked).toBeGreaterThanOrEqual(0);
		expect(Array.isArray(result.errors)).toBe(true);
	});

	test("should dispose correctly", () => {
		agentWatcher.start();
		expect(agentWatcher.getStatus().isActive).toBe(true);

		agentWatcher.dispose();
		expect(agentWatcher.getStatus().isActive).toBe(false);
	});

	test("getWebviewScript should return a string", () => {
		const script = getWebviewScript(
			RESUME_BUTTON_SELECTORS,
			RESUME_BUTTON_TEXT_PATTERNS,
			false
		);
		expect(typeof script).toBe("string");
		expect(script.length).toBeGreaterThan(0);
	});

	test("getWebviewScript should include selectors", () => {
		const customSelectors = [".custom-button"];
		const script = getWebviewScript(
			customSelectors,
			RESUME_BUTTON_TEXT_PATTERNS,
			true
		);
		expect(script).toContain(".custom-button");
		expect(script).toContain("debugMode = true");
	});

	test("Resume button selectors should be valid", () => {
		RESUME_BUTTON_SELECTORS.forEach((selector) => {
			expect(typeof selector).toBe("string");
			expect(selector.length).toBeGreaterThan(0);
		});
	});

	test("Resume button text patterns should be valid RegExp", () => {
		RESUME_BUTTON_TEXT_PATTERNS.forEach((pattern) => {
			expect(pattern instanceof RegExp).toBe(true);
		});
	});
});

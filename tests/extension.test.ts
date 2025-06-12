import { DEFAULT_CONFIG } from "../src/types";

describe("Extension Test Suite", () => {
	test("Default configuration should be correct", () => {
		expect(DEFAULT_CONFIG.enabled).toBe(true);
		expect(DEFAULT_CONFIG.checkInterval).toBe(1000);
		expect(DEFAULT_CONFIG.customSelectors).toEqual([]);
		expect(DEFAULT_CONFIG.debugMode).toBe(false);
		expect(DEFAULT_CONFIG.skipButtonEnabled).toBe(true);
		expect(DEFAULT_CONFIG.skipButtonDelay).toBe(5000);
		expect(DEFAULT_CONFIG.skipButtonCustomSelectors).toEqual([]);
	});

	test("Resume button selectors should be defined", () => {
		const {
			RESUME_BUTTON_SELECTORS,
			RESUME_BUTTON_TEXT_PATTERNS,
		} = require("../src/types");
		expect(Array.isArray(RESUME_BUTTON_SELECTORS)).toBe(true);
		expect(RESUME_BUTTON_SELECTORS.length).toBeGreaterThan(0);
		expect(Array.isArray(RESUME_BUTTON_TEXT_PATTERNS)).toBe(true);
		expect(RESUME_BUTTON_TEXT_PATTERNS.length).toBeGreaterThan(0);
	});

	test("Skip button selectors should be defined", () => {
		const {
			SKIP_BUTTON_SELECTORS,
			SKIP_BUTTON_TEXT_PATTERNS,
		} = require("../src/types");
		expect(Array.isArray(SKIP_BUTTON_SELECTORS)).toBe(true);
		expect(SKIP_BUTTON_SELECTORS.length).toBeGreaterThan(0);
		expect(Array.isArray(SKIP_BUTTON_TEXT_PATTERNS)).toBe(true);
		expect(SKIP_BUTTON_TEXT_PATTERNS.length).toBeGreaterThan(0);
	});

	test("Skip button delay should be within valid range", () => {
		expect(DEFAULT_CONFIG.skipButtonDelay).toBeGreaterThanOrEqual(1000);
		expect(DEFAULT_CONFIG.skipButtonDelay).toBeLessThanOrEqual(30000);
	});
});

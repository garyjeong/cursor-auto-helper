"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESUME_BUTTON_TEXT_PATTERNS = exports.RESUME_BUTTON_SELECTORS = exports.DEFAULT_CONFIG = void 0;
exports.DEFAULT_CONFIG = {
    enabled: true,
    checkInterval: 1000,
    customSelectors: [],
    debugMode: false,
};
exports.RESUME_BUTTON_SELECTORS = [
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
exports.RESUME_BUTTON_TEXT_PATTERNS = [
    /resume/i,
    /continue/i,
    /계속/i,
    /재개/i,
    /다시\s*시작/i,
];
//# sourceMappingURL=types.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SKIP_BUTTON_TEXT_PATTERNS = exports.SKIP_BUTTON_SELECTORS = exports.RESUME_BUTTON_TEXT_PATTERNS = exports.RESUME_BUTTON_SELECTORS = exports.DEFAULT_CONFIG = void 0;
exports.DEFAULT_CONFIG = {
    enabled: true,
    checkInterval: 1000,
    customSelectors: [],
    debugMode: false,
    skipButtonEnabled: true,
    skipButtonDelay: 5000,
    skipButtonCustomSelectors: [],
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
exports.SKIP_BUTTON_SELECTORS = [
    'button[aria-label*="skip" i]',
    'button[title*="skip" i]',
    'button:contains("Skip")',
    'button:contains("건너뛰기")',
    ".skip-button",
    '[data-testid*="skip"]',
    'button[class*="skip"]',
];
exports.SKIP_BUTTON_TEXT_PATTERNS = [
    /skip/i,
    /건너뛰기/i,
    /생략/i,
    /넘어가기/i,
];
//# sourceMappingURL=types.js.map
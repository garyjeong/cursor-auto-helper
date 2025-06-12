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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const vscode = __importStar(require("vscode"));
const types_1 = require("./types");
class ConfigManager {
    constructor() {
        this.config = vscode.workspace.getConfiguration("cursorAutoResumer");
    }
    static getInstance() {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }
    getConfig() {
        return {
            enabled: this.config.get("enabled", types_1.DEFAULT_CONFIG.enabled),
            checkInterval: this.config.get("checkInterval", types_1.DEFAULT_CONFIG.checkInterval),
            customSelectors: this.config.get("customSelectors", types_1.DEFAULT_CONFIG.customSelectors),
            debugMode: this.config.get("debugMode", types_1.DEFAULT_CONFIG.debugMode),
            skipButtonEnabled: this.config.get("skipButtonEnabled", types_1.DEFAULT_CONFIG.skipButtonEnabled),
            skipButtonDelay: this.config.get("skipButtonDelay", types_1.DEFAULT_CONFIG.skipButtonDelay),
            skipButtonCustomSelectors: this.config.get("skipButtonCustomSelectors", types_1.DEFAULT_CONFIG.skipButtonCustomSelectors),
        };
    }
    async updateConfig(key, value) {
        await this.config.update(key, value, vscode.ConfigurationTarget.Global);
        this.refresh();
    }
    refresh() {
        this.config = vscode.workspace.getConfiguration("cursorAutoResumer");
    }
    validateConfig(config) {
        const errors = [];
        if (config.checkInterval < 500 || config.checkInterval > 10000) {
            errors.push("Check interval must be between 500 and 10000 milliseconds");
        }
        if (config.skipButtonDelay < 1000 || config.skipButtonDelay > 30000) {
            errors.push("Skip button delay must be between 1000 and 30000 milliseconds");
        }
        if (!Array.isArray(config.customSelectors)) {
            errors.push("Custom selectors must be an array");
        }
        if (!Array.isArray(config.skipButtonCustomSelectors)) {
            errors.push("Skip button custom selectors must be an array");
        }
        return errors;
    }
    log(message, level = "info") {
        const config = this.getConfig();
        if (config.debugMode || level === "error") {
            const timestamp = new Date().toISOString();
            const logMessage = `[${timestamp}] [Cursor Auto Resumer] [${level.toUpperCase()}] ${message}`;
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
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=config.js.map
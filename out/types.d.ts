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
    type: "resume-button-found" | "resume-button-clicked" | "skip-button-found" | "skip-button-clicked" | "skip-button-scheduled" | "skip-button-cancelled" | "debug-log" | "error";
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
export declare const DEFAULT_CONFIG: ExtensionConfig;
export declare const RESUME_BUTTON_SELECTORS: string[];
export declare const RESUME_BUTTON_TEXT_PATTERNS: RegExp[];
export declare const SKIP_BUTTON_SELECTORS: string[];
export declare const SKIP_BUTTON_TEXT_PATTERNS: RegExp[];
//# sourceMappingURL=types.d.ts.map
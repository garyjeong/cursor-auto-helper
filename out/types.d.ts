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
export declare const DEFAULT_CONFIG: ExtensionConfig;
export declare const RESUME_BUTTON_SELECTORS: string[];
export declare const RESUME_BUTTON_TEXT_PATTERNS: RegExp[];
//# sourceMappingURL=types.d.ts.map
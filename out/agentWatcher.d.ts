import { AgentPanel, WatchResult } from "./types";
export declare class AgentWatcher {
    private panels;
    private watchTimer;
    private configManager;
    private statusBarItem;
    private isActive;
    constructor();
    start(): void;
    stop(): void;
    checkNow(): Promise<WatchResult>;
    private scheduleNextCheck;
    private scanForAgentPanels;
    private processAgentTab;
    private injectScriptIntoWebview;
    private getTabId;
    private updateStatusBar;
    getStatus(): {
        isActive: boolean;
        panelCount: number;
        panels: AgentPanel[];
    };
    dispose(): void;
}
//# sourceMappingURL=agentWatcher.d.ts.map
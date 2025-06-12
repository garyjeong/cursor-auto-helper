import { ExtensionConfig } from "./types";
export declare class ConfigManager {
    private static instance;
    private config;
    private constructor();
    static getInstance(): ConfigManager;
    getConfig(): ExtensionConfig;
    updateConfig(key: keyof ExtensionConfig, value: any): Promise<void>;
    refresh(): void;
    validateConfig(config: ExtensionConfig): string[];
    log(message: string, level?: "info" | "warn" | "error"): void;
}
//# sourceMappingURL=config.d.ts.map
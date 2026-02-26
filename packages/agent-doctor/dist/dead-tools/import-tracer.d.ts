export interface RegisteredTool {
    name: string;
    file: string;
    line: number;
}
export declare function traceRegisteredTools(files: Map<string, string>): Map<string, RegisteredTool>;

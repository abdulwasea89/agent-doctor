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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectProject = detectProject;
exports.loadProjectFiles = loadProjectFiles;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const glob_1 = require("glob");
const SOURCE_EXTENSIONS = [
    "ts", "tsx", "js", "jsx", "mjs", "cjs",
    "py", "mts", "cts",
];
async function detectProject(projectPath) {
    const pkgPath = path.join(projectPath, "package.json");
    const reqPath = path.join(projectPath, "requirements.txt");
    const pyprojectPath = path.join(projectPath, "pyproject.toml");
    let deps = {};
    let devDeps = {};
    let reqContent = "";
    let pyprojectContent = "";
    if (fs.existsSync(pkgPath)) {
        try {
            const raw = fs.readFileSync(pkgPath, "utf-8");
            const pkg = JSON.parse(raw);
            deps = pkg.dependencies ?? {};
            devDeps = pkg.devDependencies ?? {};
        }
        catch {
            // ignore
        }
    }
    if (fs.existsSync(reqPath)) {
        reqContent = fs.readFileSync(reqPath, "utf-8");
    }
    if (fs.existsSync(pyprojectPath)) {
        pyprojectContent = fs.readFileSync(pyprojectPath, "utf-8");
    }
    const allDeps = { ...deps, ...devDeps };
    const allText = reqContent + pyprojectContent;
    const framework = detectFramework(allDeps, allText);
    const modelProvider = detectModelProvider(allDeps, allText);
    const language = await detectLanguage(projectPath);
    const memoryBackend = detectMemoryBackend(allDeps, allText);
    const mcpCompliant = detectMcpCompliance(allDeps, projectPath);
    const toolCount = await detectToolCount(projectPath);
    return {
        framework,
        modelProvider,
        toolCount,
        memoryBackend,
        mcpCompliant,
        language,
        projectPath,
    };
}
function detectFramework(deps, reqText) {
    const keys = Object.keys(deps).join(" ");
    if (keys.includes("langchain") || keys.includes("@langchain/core"))
        return "langchain";
    if (reqText.toLowerCase().includes("crewai"))
        return "crewai";
    if (reqText.toLowerCase().includes("autogen") || reqText.toLowerCase().includes("pyautogen"))
        return "autogen";
    if (keys.includes("@modelcontextprotocol/sdk") || keys.includes("mcp"))
        return "mcp";
    if (keys.includes("mastra"))
        return "mastra";
    if (keys.includes("llamaindex"))
        return "llamaindex";
    // Also check requirement text for these
    if (reqText.toLowerCase().includes("langchain"))
        return "langchain";
    return "custom";
}
function detectModelProvider(deps, reqText) {
    const keys = Object.keys(deps).join(" ");
    if (keys.includes("openai") || reqText.toLowerCase().includes("openai"))
        return "openai";
    if (keys.includes("@anthropic-ai/sdk") || reqText.toLowerCase().includes("anthropic"))
        return "anthropic";
    if (keys.includes("@google/generative-ai") || reqText.toLowerCase().includes("google-generativeai"))
        return "google";
    if (keys.includes("ollama") || reqText.toLowerCase().includes("ollama"))
        return "ollama";
    return "unknown";
}
async function detectLanguage(projectPath) {
    const pyFiles = await (0, glob_1.glob)("**/*.py", {
        cwd: projectPath,
        ignore: ["node_modules/**", "dist/**", ".git/**"],
        nodir: true,
    });
    if (pyFiles.length > 0)
        return "python";
    const tsFiles = await (0, glob_1.glob)("**/*.{ts,tsx,mts,cts}", {
        cwd: projectPath,
        ignore: ["node_modules/**", "dist/**", ".git/**"],
        nodir: true,
    });
    if (tsFiles.length > 0)
        return "typescript";
    const jsFiles = await (0, glob_1.glob)("**/*.{js,jsx,mjs,cjs}", {
        cwd: projectPath,
        ignore: ["node_modules/**", "dist/**", ".git/**"],
        nodir: true,
    });
    if (jsFiles.length > 0)
        return "javascript";
    return "unknown";
}
function detectMemoryBackend(deps, reqText) {
    const keys = Object.keys(deps).join(" ");
    const combined = keys + " " + reqText.toLowerCase();
    if (combined.includes("redis"))
        return "redis";
    if (combined.includes("pinecone"))
        return "pinecone";
    if (combined.includes("chroma"))
        return "chroma";
    if (combined.includes("weaviate"))
        return "weaviate";
    if (combined.includes("pgvector") || combined.includes("pg-vector"))
        return "pgvector";
    if (combined.includes("qdrant"))
        return "qdrant";
    return "none";
}
function detectMcpCompliance(deps, projectPath) {
    const keys = Object.keys(deps).join(" ");
    if (keys.includes("@modelcontextprotocol") || keys.includes("mcp"))
        return true;
    // Check for MCP server config files
    const mcpConfigFiles = [
        "mcp.json", ".mcp.json", "mcp-server.json",
        "mcp-config.json", ".cursor/mcp.json",
    ];
    for (const f of mcpConfigFiles) {
        if (fs.existsSync(path.join(projectPath, f)))
            return true;
    }
    return false;
}
async function detectToolCount(projectPath) {
    const ext = `{${SOURCE_EXTENSIONS.join(",")}}`;
    const files = await (0, glob_1.glob)(`**/*.${ext}`, {
        cwd: projectPath,
        ignore: ["**/node_modules/**", "**/dist/**", "**/.git/**", "**/__pycache__/**", "**/*.d.ts"],
        nodir: true,
    });
    const toolPatterns = [
        /\.tool\s*\(/g,
        /register_tool\s*\(/g,
        /@tool\b/g,
        /DynamicTool\s*\(/g,
        /StructuredTool\s*\(/g,
        /\bTool\s*\(/g,
        /tools\s*:\s*\[/g,
        /tools\s*=\s*\[/g,
    ];
    let count = 0;
    for (const file of files) {
        try {
            const content = fs.readFileSync(path.join(projectPath, file), "utf-8");
            for (const pattern of toolPatterns) {
                const matches = content.match(pattern);
                if (matches)
                    count += matches.length;
            }
        }
        catch {
            // ignore unreadable files
        }
    }
    return count;
}
async function loadProjectFiles(projectPath) {
    const ext = `{${SOURCE_EXTENSIONS.join(",")}}`;
    const IGNORE = [
        "**/node_modules/**",
        "**/dist/**",
        "**/.git/**",
        "**/__pycache__/**",
        "**/*.min.js",
        "**/*.d.ts",
    ];
    const files = await (0, glob_1.glob)(`**/*.${ext}`, {
        cwd: projectPath,
        ignore: IGNORE,
        nodir: true,
    });
    // Also include config files
    const configFiles = await (0, glob_1.glob)("**/{Dockerfile,docker-compose.yml,docker-compose.yaml,.env,.env.*,*.yaml,*.yml,*.json,*.toml,*.ini,Makefile,requirements*.txt,pyproject.toml}", {
        cwd: projectPath,
        ignore: [...IGNORE, "**/package-lock.json", "**/yarn.lock"],
        nodir: true,
    });
    const allFiles = [...new Set([...files, ...configFiles])];
    const map = new Map();
    for (const file of allFiles) {
        try {
            const content = fs.readFileSync(path.join(projectPath, file), "utf-8");
            map.set(file, content);
        }
        catch {
            // ignore
        }
    }
    return map;
}
//# sourceMappingURL=detector.js.map
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
exports.loadConfig = loadConfig;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const DEFAULT_CONFIG = {
    ignore: {
        rules: [],
        files: [],
    },
};
function loadConfig(projectPath) {
    // Try agent-doctor.config.json first
    const configFile = path.join(projectPath, "agent-doctor.config.json");
    if (fs.existsSync(configFile)) {
        try {
            const raw = fs.readFileSync(configFile, "utf-8");
            const parsed = JSON.parse(raw);
            return mergeConfig(parsed);
        }
        catch {
            // fall through
        }
    }
    // Try agentDoctor key in package.json
    const pkgFile = path.join(projectPath, "package.json");
    if (fs.existsSync(pkgFile)) {
        try {
            const raw = fs.readFileSync(pkgFile, "utf-8");
            const pkg = JSON.parse(raw);
            if (pkg.agentDoctor && typeof pkg.agentDoctor === "object") {
                return mergeConfig(pkg.agentDoctor);
            }
        }
        catch {
            // fall through 
        }
    }
    return { ...DEFAULT_CONFIG, ignore: { rules: [], files: [] } };
}
function mergeConfig(partial) {
    return {
        ignore: {
            rules: partial.ignore?.rules ?? [],
            files: partial.ignore?.files ?? [],
        },
        threshold: partial.threshold,
        output: partial.output,
    };
}
//# sourceMappingURL=config.js.map
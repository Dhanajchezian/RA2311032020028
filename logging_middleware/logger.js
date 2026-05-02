"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
exports.Log = Log;
const crypto_1 = require("crypto");
const validator_1 = require("./validator");
const apiClient_1 = require("./apiClient");
const DEFAULT_LOG_API_URL = process.env.LOG_API_URL ?? '';
const DEFAULT_ACCESS_TOKEN = process.env.ACCESS_TOKEN ?? '';
function resolveOptions(options) {
    if (options?.logApiUrl && options?.accessToken) {
        return options;
    }
    if (!DEFAULT_LOG_API_URL || !DEFAULT_ACCESS_TOKEN) {
        throw new Error('Logging environment variables are required');
    }
    return {
        logApiUrl: DEFAULT_LOG_API_URL,
        accessToken: DEFAULT_ACCESS_TOKEN,
    };
}
function buildEntry(stack, level, packageName, message, requestId, metadata) {
    return {
        stack,
        level,
        package: packageName,
        message,
        timestamp: new Date().toISOString(),
        requestId: requestId ?? (0, crypto_1.randomUUID)(),
        metadata,
    };
}
async function Log(stack, level, packageName, message, requestId, metadata) {
    const options = resolveOptions();
    const payload = buildEntry(stack, level, packageName, message, requestId, metadata);
    (0, validator_1.validateLogEntry)(payload);
    try {
        await (0, apiClient_1.sendLogPayload)(payload, options.logApiUrl, options.accessToken);
    }
    catch {
        // Silent fallback: do not crash the application.
    }
}
class Logger {
    constructor(options) {
        this.options = resolveOptions(options);
    }
    async log(stack, level, packageName, message, requestId, metadata) {
        const payload = buildEntry(stack, level, packageName, message, requestId, metadata);
        (0, validator_1.validateLogEntry)(payload);
        try {
            await (0, apiClient_1.sendLogPayload)(payload, this.options.logApiUrl, this.options.accessToken);
        }
        catch {
            // Silent fallback: preserve application flow.
        }
    }
}
exports.Logger = Logger;
/*
Example usage:
import {Log} from './logging_middleware';

void Log('backend', 'error', 'handler', 'Invalid input received');
*/
//# sourceMappingURL=logger.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendLogPayload = sendLogPayload;
const axios_1 = __importDefault(require("axios"));
const REQUEST_TIMEOUT_MS = 3000;
const MAX_ATTEMPTS = 2;
async function sendLogPayload(payload, logApiUrl, accessToken) {
    const headers = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    };
    let lastError = 'Unknown logging failure';
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        try {
            await axios_1.default.post(logApiUrl, payload, {
                headers,
                timeout: REQUEST_TIMEOUT_MS,
            });
            return;
        }
        catch (error) {
            if (isAxiosError(error)) {
                lastError = error.message;
            }
            else if (error instanceof Error) {
                lastError = error.message;
            }
            else {
                lastError = String(error);
            }
            if (attempt === MAX_ATTEMPTS) {
                throw new Error(String(lastError));
            }
        }
    }
}
function isAxiosError(error) {
    return !!(error && typeof error === 'object' && 'isAxiosError' in error);
}
//# sourceMappingURL=apiClient.js.map
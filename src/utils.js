import path from "path";
import { fileURLToPath } from 'url';

export function getCurrentDirname(importMetaUrl) {
    const __filename = fileURLToPath(importMetaUrl);
    return path.dirname(__filename);
}
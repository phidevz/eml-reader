import "@tanstack/react-start/server-only";

import fs from "fs/promises";
import path from "path";
import {CatchAllUser, type GetFileTreeOptions, PathNotFoundError, type Username} from "@/lib/api.ts";
import {getOptions} from "@/lib/options.server.ts";
import {createServerOnlyFn} from "@tanstack/react-start";
import Parser, {type Attachment} from "postal-mime";
import type {Dirent} from "node:fs";

declare global {
    var __fileTreeCache: Map<Username, CacheEntry> | undefined;
}

interface CacheEntry {
    data: FileTreeNode[];
    timestamp: number;
}

globalThis.__fileTreeCache ??= new Map<Username, CacheEntry>();
let fileTreeCache = globalThis.__fileTreeCache;

export async function getFileTree(username: Username, options ?: GetFileTreeOptions): Promise<CacheEntry> {
    const {ttlSeconds, mailRoot} = getOptions();
    const now = Date.now();

    let cachedEntry = fileTreeCache.get(username);

    if (
        !!cachedEntry &&
        !options?.forceRefresh &&
        now - cachedEntry.timestamp < ttlSeconds
    ) {
        console.debug(`[Cache] Returning cached file tree (user=${username})`);

        return cachedEntry;
    }

    console.debug(`[Cache] Building fresh file tree (user=${username})`);
    let userSpecificMailRoot = mailRoot;
    if (username !== CatchAllUser) {
        userSpecificMailRoot = path.join(userSpecificMailRoot, username);
    }

    const data = await buildFileTree(userSpecificMailRoot, userSpecificMailRoot);
    cachedEntry = {
        data,
        timestamp: now,
    }

    fileTreeCache.set(username, cachedEntry);

    return cachedEntry;
}

export interface FileTreeNode {
    name: string;
    path: string;
    isFile: boolean;
    children?: FileTreeNode[];
}

export async function buildFileTree(
    MAIL_ROOT: string,
    dirPath: string,
): Promise<FileTreeNode[]> {
    let entries: Dirent[];
    try {
        entries = await fs.readdir(dirPath, {withFileTypes: true});
    } catch (error) {
        console.log(`Directory does not exist: ${dirPath}`)
        return [];
    }

    try {
        const nodes: FileTreeNode[] = [];

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            const relativePath = path
                .relative(MAIL_ROOT, fullPath)
                .replaceAll("\\", "/");

            if (entry.isDirectory()) {
                const children = await buildFileTree(MAIL_ROOT, fullPath);
                if (children.length > 0) {
                    nodes.push({
                        name: entry.name,
                        path: relativePath + "/",
                        isFile: false,
                        children,
                    });
                }
            } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".eml")) {
                nodes.push({
                    name: entry.name,
                    path: relativePath,
                    isFile: true,
                });
            }
        }

        return nodes.sort((a, b) => {
            if (a.isFile !== b.isFile) {
                return a.isFile ? 1 : -1;
            }
            return a.name.localeCompare(b.name);
        });
    } catch (error) {
        console.error(`Failed to scan directory ${dirPath}:`, error);
        return [];
    }
}

export async function readEmlFile(username: Username, relativePath: string): Promise<string> {
    const {mailRoot: MAIL_ROOT} = getOptions();
    let userSpecificMailRoot = MAIL_ROOT;
    if (username !== CatchAllUser) {
        userSpecificMailRoot = path.join(userSpecificMailRoot, username);
    }
    const fullPath = path.join(userSpecificMailRoot, relativePath);

    // Prevent directory traversal attacks
    const resolved = path.resolve(fullPath);
    const mailRoot = path.resolve(userSpecificMailRoot);
    if (!resolved.startsWith(mailRoot)) {
        throw new PathNotFoundError();
    }
    const fileExists = await fs.access(fullPath).then(() => true).catch(() => false);
    if (!fileExists) {
        throw new PathNotFoundError();
    }

    return await fs.readFile(fullPath, "utf-8");
}

export const readEmail = createServerOnlyFn(async (username: Username, relativePath: string) => {
    const fileContent = await readEmlFile(username, relativePath);
    return await new Parser().parse(fileContent);
});

export const toAttachmentMeta = createServerOnlyFn((att: Attachment) => {
    return {
        filename: att.filename ?? undefined,
        cid: att.contentId,
        contentType: att.mimeType,
        size:
            typeof att.content === "string"
                ? att.content.length
                : att.content.byteLength,
        contentDisposition: att.disposition ?? undefined,
    };
});
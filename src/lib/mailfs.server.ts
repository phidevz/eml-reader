import "@tanstack/react-start/server-only";

import fs from "fs/promises";
import path from "path";
import type { GetFileTreeOptions } from "@/lib/api.ts";
import { getOptions } from "@/lib/options.server.ts";
import { createServerOnlyFn } from "@tanstack/react-start";
import Parser, { type Attachment } from "postal-mime";

interface CacheEntry {
  data: FileTreeNode[];
  timestamp: number;
}

let fileTreeCache: CacheEntry | null = null;

export async function getFileTree(
  options?: GetFileTreeOptions,
): Promise<FileTreeNode[]> {
  const { ttlSeconds, mailRoot } = getOptions();
  const now = Date.now();

  if (
    fileTreeCache &&
    !options?.forceRefresh &&
    now - fileTreeCache.timestamp < ttlSeconds
  ) {
    console.debug("[Cache] Returning cached file tree");
    return fileTreeCache.data;
  }

  console.debug("[Cache] Building fresh file tree");
  const data = await buildFileTree(mailRoot, mailRoot);

  // Update cache
  fileTreeCache = {
    data,
    timestamp: now,
  };

  return data;
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
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
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

export async function readEmlFile(relativePath: string): Promise<string> {
  const { mailRoot: MAIL_ROOT } = getOptions();
  const fullPath = path.join(MAIL_ROOT, relativePath);

  // Prevent directory traversal attacks
  const resolved = path.resolve(fullPath);
  const mailRoot = path.resolve(MAIL_ROOT);
  if (!resolved.startsWith(mailRoot)) {
    throw new Error("Invalid file path");
  }

  return await fs.readFile(fullPath, "utf-8");
}

export const readEmail = createServerOnlyFn(async (relativePath: string) => {
  const fileContent = await readEmlFile(relativePath);
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
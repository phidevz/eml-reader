import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  getFileTree as getFileTreeImpl,
  readEmail,
  toAttachmentMeta,
} from "@/lib/mailfs.server.ts";

export const GetFileTreeSchema = z
  .object({
    forceRefresh: z.boolean().optional().default(false),
  })
  .optional();

export type GetFileTreeOptions = z.infer<typeof GetFileTreeSchema>;

export const getFileTree = createServerFn({ method: "GET" })
  .inputValidator(GetFileTreeSchema)
  .handler(async ({ data }) => {
    return await getFileTreeImpl(data);
  });

export const GetEmailSchema = z.object({
  path: z.string().nonempty(),
});

export const getEmail = createServerFn({ method: "GET" })
  .inputValidator(GetEmailSchema)
  .handler(async ({ data: { path: relativePath } }) => {
    const email = await readEmail(relativePath);

    return {
      pathOnDisk: relativePath,
      headers: Object.fromEntries(email.headers.entries()),
      subject: email.subject,
      from: email.from?.name,
      to: email.to?.at(0)?.name,
      date: !!email.date ? new Date(email.date) : undefined,
      text: email.text,
      html: email.html || undefined,
      attachments: (email.attachments || []).map(toAttachmentMeta),
    };
  });

export interface ParsedEmail {
  pathOnDisk: string;
  headers: Record<string, any>;
  subject?: string;
  from?: string;
  to?: string;
  date?: Date;
  text?: string;
  html?: string;
  attachments: Array<{
    filename?: string;
    cid?: string;
    contentType?: string;
    size: number;
    contentDisposition?: string;
  }>;
}
